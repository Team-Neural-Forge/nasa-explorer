import "./App.css";
import { GameShell } from "./interface/game_shell";
import { GameStateProvider } from "./state/game_state";

const App = () => {
	return (
		<GameStateProvider>
			<GameShell />
		</GameStateProvider>
	);
};

export default App;
