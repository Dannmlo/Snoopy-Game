import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  Image // 1. Importamos o componente Image
} from 'react-native';

// --- DEFINIÇÕES DO JOGO ---

// Os nomes (identificadores) das cartas
const CARTOON_IMAGES = [
  'Snoopy',
  'Woodstock',
  'Charlie',
  'Lucy',
  'Linus',
  'Sally',
];

/**
 * 2. O "Mapa" de Imagens
 * Ligamos o nome do identificador (ex: 'Snoopy') ao arquivo de imagem.
 * Ajuste os caminhos/nomes aqui se os seus forem diferentes!
 */
const IMAGE_MAP: { [key: string]: any } = {
  'Snoopy': require('../../assets/images/snoopy.jpg'),
  'Woodstock': require('../../assets/images/woodstock.jpg'),
  'Charlie': require('../../assets/images/charlie.jpg'),
  'Lucy': require('../../assets/images/lucy.jpg'),
  'Linus': require('../../assets/images/linus.jpg'),
  'Sally': require('../../assets/images/sally.jpg'),
};


// Pontuação
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
    image: imageName, // O 'image' aqui continua sendo o NOME (ex: 'Snoopy')
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
  // (Esta parte não muda em nada)

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

  // --- Funções Auxiliares (flipCard, resetTurn, resetGame) ---
  // (Esta parte também não muda)

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

  
  // --- Renderização (O que o usuário vê) ---
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Snoopy-Game</Text>
      <Text style={styles.scoreText}>Pontuação: {score}</Text>

      {!gameStarted ? (
        <TouchableOpacity style={styles.playButton} onPress={resetGame}>
          <Text style={styles.playButtonText}>Jogar!</Text>
        </TouchableOpacity>
      ) : (
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
              {/* * 3. MUDANÇA PRINCIPAL
               * Se a carta estiver virada, mostramos a IMAGEM
               * Se não, mostramos o texto de '?'
               */}
              {(card.isFlipped || card.isMatched) ? (
                // Usamos o 'card.image' (ex: 'Snoopy') para buscar a fonte no IMAGE_MAP
                <Image source={IMAGE_MAP[card.image]} style={styles.cardImage} />
              ) : (
                <Text style={styles.cardTextDown}>?</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  scoreText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 20,
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
  board: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  card: {
    width: 80,
    height: 100,
    margin: 5,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden', // Garante que a imagem não vaze
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
  /**
   * 4. NOVO ESTILO para a imagem dentro da carta
   */
  cardImage: {
    width: '90%',
    height: '90%',
    resizeMode: 'contain', // 'contain' garante que a imagem caiba sem distorcer
  },
});