# 🪑 Virtual Chair Grabbing Game

A fun web-based implementation of the classic "Musical Chairs" game! Players circle around chairs while music plays, and when the music stops, they must quickly grab a chair. The player without a chair is eliminated!

## 🎮 Game Features

- **Interactive Gameplay**: Click on chairs to grab them when the music stops
- **Dynamic Player Count**: Support for 2-12 players
- **Visual Animations**: Smooth animations for players, chairs, and game states
- **Sound Effects**: Background music during gameplay and sound effects for actions
- **Real-time Statistics**: Track players, chairs, rounds, and game time
- **Leaderboard**: View final results and rankings
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 How to Play

1. **Set Players**: Choose the number of players (2-12) using the input field
2. **Start Game**: Click "Start Game" to begin
3. **Music Phase**: Players will circle around chairs while music plays
4. **Grab Chairs**: When music stops, quickly click on available chairs
5. **Elimination**: The player without a chair is eliminated
6. **Continue**: The game continues with one less chair each round
7. **Victory**: Last player standing wins!

## 🎯 Game Rules

- There's always one fewer chair than the number of active players
- Players can only grab chairs when the music stops
- Each round eliminates one player
- The game continues until only one player remains
- Clicking on chairs while music is playing shows a warning

## 🛠️ Technical Features

- **Pure JavaScript**: No external dependencies
- **Web Audio API**: Real-time audio generation for music and sound effects
- **CSS Animations**: Smooth transitions and visual feedback
- **Responsive Layout**: Adapts to different screen sizes
- **Modern Design**: Clean, colorful interface with gradient backgrounds

## 🎵 Audio System

The game uses the Web Audio API to generate:
- **Background Music**: Continuous tone with random variations during gameplay
- **Chair Grab Sound**: Success sound when a chair is grabbed
- **Elimination Sound**: Low tone when a player is eliminated
- **Victory Fanfare**: Musical sequence when the game ends

## 🎨 Visual Design

- **Gradient Backgrounds**: Beautiful color transitions
- **Animated Elements**: Bouncing music notes, glowing chairs, rotating players
- **Status Messages**: Color-coded feedback for different game states
- **Player Avatars**: Numbered, colored circles representing players
- **Chair Icons**: 3D-styled chair emojis with hover effects

## 📱 Responsive Features

- **Mobile-Friendly**: Touch-friendly interface for mobile devices
- **Adaptive Layout**: Adjusts to different screen sizes
- **Accessible Controls**: Large, easy-to-tap buttons
- **Scalable Elements**: Elements resize appropriately on smaller screens

## 🔧 Files Structure

```
chair-game/
├── index.html          # Main HTML structure
├── styles.css          # Complete CSS styling and animations
├── script.js           # Game logic and interactivity
└── README.md          # This documentation
```

## 🌟 Game States

1. **Setup**: Initial state where players set game parameters
2. **Playing**: Game in progress with music and player movement
3. **Chair Grabbing**: Music stopped, players can grab chairs
4. **Round End**: Elimination phase and preparing for next round
5. **Game Over**: Final results and leaderboard display

## 🎪 Special Features

- **Auto-Stop Music**: Music stops automatically after random intervals
- **Manual Stop**: Players can force-stop music for strategy
- **Round Progression**: Automatic progression through rounds
- **Visual Feedback**: Immediate visual response to all actions
- **Game Statistics**: Real-time tracking of game progress

## 🏆 Scoring System

- **Winner**: 1st place (last player standing)
- **Eliminated Players**: Ranked by elimination order
- **Round Tracking**: Shows which round each player was eliminated
- **Time Tracking**: Total game duration display

## 💡 Tips for Playing

- **Stay Alert**: Music can stop at any time
- **Be Quick**: Limited time to grab chairs after music stops
- **Watch Others**: See which chairs are already taken
- **Use Strategy**: Position yourself near multiple chairs
- **Have Fun**: It's all about quick reflexes and luck!

## 🎉 Enjoy the Game!

This virtual chair grabbing game brings the classic party game to your web browser. Perfect for remote parties, family gatherings, or just having fun with friends online!

---

*Made with ❤️ using HTML, CSS, and JavaScript*