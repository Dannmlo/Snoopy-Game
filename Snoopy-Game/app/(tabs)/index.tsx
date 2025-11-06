import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  Image,
  BackHandler
} from 'react-native';
import { useFocusEffect } from 'expo-router';

// --- DEFINIÇÕES DO JOGO ---

const CARTOON_IMAGES = [
  'Snoopy',
  'Woodstock',
  'Charlie',
  'Lucy',
  'Linus',
  'Sally',
];

const IMAGE_MAP: { [key: string]: any } = {
  'Snoopy': require('../../assets/images/snoopy.jpg'),
  'Snoopyrun': require('../../assets/images/snoopyrun.png'),
  'Snoopynatal': require('../../assets/images/snoopynatal.png'),
  'Woodstock': require('../../assets/images/woodstock.jpg'),
  'Charlie': require('../../assets/images/charlie.jpg'),
  'Lucy': require('../../assets/images/lucy.jpg'),
  'Linus': require('../../assets/images/linus.jpg'),
  'Sally': require('../../assets/images/sally.jpg'),
};

const POINTS_PER_MATCH = 10;
const PENALTY_PER_MISS = 2;

type Card = {
  id: number;
  image: string;
  isFlipped: boolean;
  isMatched: boolean;
};

function shuffleArray(array: string[]) {
  const newArray = [...array]; 
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

const createGameBoard = (): Card[] => {
  const duplicatedImages = [...CARTOON_IMAGES, ...CARTOON_IMAGES];
  const shuffledImages = shuffleArray(duplicatedImages);

  return shuffledImages.map((imageName: string, index: number) => ({
    id: index,
    image: imageName,
    isFlipped: false,
    isMatched: false,
  }));
};

// --- O COMPONENTE DO JOGO ---

export default function SnoopyGameScreen() {
  
  // --- Estados do Jogo ---
  const [board, setBoard] = useState<Card[]>([]);
  const [firstSelected, setFirstSelected] = useState<Card | null>(null);
  const [secondSelected, setSecondSelected] = useState<Card | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  // --- Lógica Principal (handleCardPress, useEffects) ---
  // (Nenhuma mudança aqui, todo o código é o mesmo)

  const handleCardPress = (clickedCard: Card) => {
    if (isChecking || clickedCard.isFlipped) {
      return;
    }
    flipCard(clickedCard.id, true);
    if (!firstSelected) {
      setFirstSelected(clickedCard);
    } else {
      setSecondSelected(clickedCard);
      setIsChecking(true);
    }
  };

  useEffect(() => {
    if (firstSelected && secondSelected) {
      if (firstSelected.image === secondSelected.image) {
        setBoard(prevBoard =>
          prevBoard.map(card =>
            card.image === firstSelected.image ? { ...card, isMatched: true } : card
          )
        );
        setScore(prevScore => prevScore + POINTS_PER_MATCH);
        resetTurn();
      } else {
        setScore(prevScore => Math.max(0, prevScore - PENALTY_PER_MISS));
        setTimeout(() => {
          flipCard(firstSelected.id, false);
          flipCard(secondSelected.id, false);
          resetTurn();
        }, 1000);
      }
    }
  }, [firstSelected, secondSelected]);

  useEffect(() => {
    if (gameStarted && board.length > 0) {
      const allMatched = board.every(card => card.isMatched);
      if (allMatched) {
        setTimeout(() => {
          Alert.alert("Parabéns!", `Você terminou com ${score} pontos!`, [
            { text: "Jogar de Novo", onPress: resetGame }
          ]);
        }, 500);
      }
    }
  }, [board, gameStarted, score]);

  // --- Funções Auxiliares (flipCard, resetTurn, resetGame, handleQuitGame, useFocusEffect) ---
  // (Nenhuma mudança aqui, todo o código é o mesmo)

  const flipCard = (cardId: number, isFlipped: boolean) => {
    setBoard(prevBoard =>
      prevBoard.map(card =>
        card.id === cardId ? { ...card, isFlipped } : card
      )
    );
  };

  const resetTurn = () => {
    setFirstSelected(null);
    setSecondSelected(null);
    setIsChecking(false);
  };

  const resetGame = () => {
    setBoard(createGameBoard());
    setScore(0);
    setGameStarted(true);
    setFirstSelected(null);
    setSecondSelected(null);
    setIsChecking(false);
  };

  const handleQuitGame = () => {
    Alert.alert(
      "Sair da Partida",
      "Deseja voltar para o menu? Sua pontuação será perdida.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sim, Sair",
          onPress: () => {
            setGameStarted(false);
            setScore(0);
            setBoard([]);
          },
        },
      ]
    );
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (gameStarted) {
          handleQuitGame();
          return true;
        } else {
          return false;
        }
      };
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );
      return () => subscription.remove();
    }, [gameStarted])
  );

  
  // --- Renderização (O que o usuário vê) ---
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Snoopy-Game</Text>
      
      {/* * ===== MUDANÇA PRINCIPAL AQUI =====
       * Agora o placar SÓ aparece se o jogo começou.
       * A tela inicial (!gameStarted) agora tem uma imagem "logo".
       */}

      {!gameStarted ? (
        // Se o jogo NÃO começou (TELA DE MENU)
        <View style={styles.menuContainer}>
          <Image 
            source={IMAGE_MAP['Snoopynatal']} // Usando a imagem do Snoopy como "logo"
            style={styles.menuLogo}
          />
          <TouchableOpacity style={styles.playButton} onPress={resetGame}>
            <Text style={styles.playButtonText}>Jogar!</Text>
          </TouchableOpacity>
        </View>

      ) : (
        // Se o jogo COMEÇOU (TELA DO JOGO)
        <>
          {/* O PLACAR FOI MOVIDO PARA AQUI DENTRO */}
          <Text style={styles.scoreText}>Pontuação: {score}</Text>

          <TouchableOpacity style={styles.quitButton} onPress={handleQuitGame}>
            <Text style={styles.quitButtonText}>Sair</Text>
          </TouchableOpacity>

          <View style={styles.board}>
            {board.map((card) => (
              <TouchableOpacity
                key={card.id}
                style={[
                  styles.card,
                  (card.isFlipped || card.isMatched) ? styles.cardFlipped : styles.cardDown
                ]}
                onPress={() => handleCardPress(card)}
                disabled={card.isFlipped || isChecking}
              >
                {(card.isFlipped || card.isMatched) ? (
                  <Image source={IMAGE_MAP[card.image]} style={styles.cardImage} />
                ) : (
                  <Text style={styles.cardTextDown}>?</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

    </View>
  );
}

// --- ESTILOS ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32, // Aumentei um pouco o título
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    // Faz o título ficar sempre no topo, mesmo no menu
    position: 'absolute',
    top: 60, 
  },
  
  // === NOVOS ESTILOS PARA O MENU ===
  menuContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  menuLogo: {
    width: 400,
    height: 400,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  // ================================

  scoreText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ff0000ff',
    marginBottom: 20,
    // Faz o placar ficar fixo abaixo do título
    position: 'absolute',
    top: 110,
  },
  playButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    elevation: 3,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  quitButton: {
    position: 'absolute',
    top: 60, // Ajustado para não sobrepor o título
    left: 20,
    backgroundColor: '#f44336',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    zIndex: 10,
    elevation: 5,
  },
  quitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  board: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    // Adicionado marginTop para não ficar atrás do placar/título
    marginTop: 100, 
  },
  card: {
    width: 80,
    height: 100,
    margin: 5,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cardDown: {
    backgroundColor: '#4a90e2',
    borderColor: '#fff',
  },
  cardFlipped: {
    backgroundColor: '#e0e0e0',
    borderColor: '#999',
  },
  cardTextDown: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  cardImage: {
    width: '90%',
    height: '90%',
    resizeMode: 'contain',
  },
});