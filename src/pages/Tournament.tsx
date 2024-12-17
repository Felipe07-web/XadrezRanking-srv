import React, { useEffect, useState } from 'react';
import { Player, Match } from '../types';
import Confetti from 'react-confetti';
const BACKEND_URL = "https://xadrezranking-srv-production.up.railway.app";

export default function Tournament() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedWinner, setSelectedWinner] = useState<{ matchId: string; winnerId: string } | null>(null);
  const [tournamentWinner, setTournamentWinner] = useState<Player | null>(null);

  // Função para buscar jogadores do backend
  useEffect(() => {
    async function fetchMatches() {
      try {
        const response = await fetch(`${BACKEND_URL}/matches`);
        const data = await response.json();
        if (data.length > 0) {
          setMatches(data);
        } else {
          console.log("Nenhuma partida encontrada. Inicialize um novo torneio.");
        }
      } catch (error) {
        console.error('Erro ao buscar partidas salvas:', error);
      }
    }
  
    async function fetchPlayers() {
      try {
        const response = await fetch(`${BACKEND_URL}/players`);
        const data = await response.json();
        setPlayers(data);
      } catch (error) {
        console.error('Erro ao buscar jogadores:', error);
      }
    }
  
    fetchMatches(); // Busca as partidas do MongoDB
    fetchPlayers(); // Busca os jogadores
  }, []);
  

  // Salvar as partidas no MongoDB
  const saveMatches = async (matches: Match[]) => {
    try {
      const response = await fetch(`${BACKEND_URL}/matches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(matches),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro ao salvar partidas:', errorData.error);
        return;
      }

      console.log('Partidas salvas com sucesso no MongoDB!');
    } catch (error) {
      console.error('Erro ao salvar partidas no backend:', error);
    }
  };

  // Inicializa o torneio com as partidas
  const initializeTournament = () => {
    if (players.length < 8) {
      alert('É necessário ter pelo menos 8 jogadores para iniciar o torneio.');
      return;
    }

    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
    const generatedMatches: Match[] = [];

    // Quartas de final
    for (let i = 0; i < shuffledPlayers.length; i += 2) {
      generatedMatches.push({
        id: crypto.randomUUID(),
        round: 'quarter-finals',
        player1Id: shuffledPlayers[i].id,
        player2Id: shuffledPlayers[i + 1]?.id || null,
        winnerId: null,
      });
    }

    // Semifinais e finais
    for (let i = 0; i < 2; i++) {
      generatedMatches.push({
        id: crypto.randomUUID(),
        round: 'semi-finals',
        player1Id: null,
        player2Id: null,
        winnerId: null,
      });
    }
    generatedMatches.push({
      id: crypto.randomUUID(),
      round: 'finals',
      player1Id: null,
      player2Id: null,
      winnerId: null,
    });

    setMatches(generatedMatches);
    saveMatches(generatedMatches); // Salva as partidas no MongoDB
    localStorage.removeItem('matches');
    setTournamentWinner(null);
  };

  // Confirma o vencedor de uma partida e atualiza os pontos
  const confirmWinner = async (matchId: string, winnerId: string, increment: number) => {
    try {
      // Atualiza os pontos do jogador vencedor
      await fetch(`${BACKEND_URL}/players/${winnerId}/points`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ increment }),
      });
  
      // Atualiza o vencedor no estado local
      const updatedMatches = matches.map((match) =>
        match.id === matchId ? { ...match, winnerId } : match
      );
      setMatches(updatedMatches);
      saveMatches(updatedMatches);
  
      // Verifica se a partida atual é a "finals" e define o campeão
      const currentMatch = matches.find((match) => match.id === matchId);
      if (currentMatch?.round === "finals") {
        const champion = players.find((player) => player.id === winnerId);
        setTournamentWinner(champion || null);
      } else {
        // Verifica se há uma próxima partida
        const nextMatch = getNextMatch(currentMatch!);
        if (nextMatch) updateNextMatch(nextMatch, winnerId);
      }
  
      setSelectedWinner(null); // Limpa a seleção
    } catch (error) {
      console.error("Erro ao confirmar o vencedor:", error);
    }
  };
  

  const getNextMatch = (currentMatch: Match) => {
    const roundMap: { [key: string]: number[][] } = {
      'quarter-finals': [[0, 1], [2, 3]], // Semifinais recebem os vencedores das quartas
      'semi-finals': [[4, 5]], // Final recebe os vencedores das semifinais
    };
  
    // Mapeia qual partida da próxima rodada recebe os vencedores atuais
    if (currentMatch.round === 'quarter-finals') {
      return matches[4 + Math.floor(matches.indexOf(currentMatch) / 2)];
    }
    if (currentMatch.round === 'semi-finals') {
      return matches[6];
    }
  
    return null;
  };
  

  const updateNextMatch = (nextMatch: Match, winnerId: string) => {
    const updatedMatch = {
      ...nextMatch,
      player1Id: nextMatch.player1Id ? nextMatch.player1Id : winnerId,
      player2Id: nextMatch.player1Id ? winnerId : nextMatch.player2Id,
    };
    setMatches((prev) => prev.map((match) => (match.id === nextMatch.id ? updatedMatch : match)));
  };

  const getPlayer = (id: string | null) => players.find((player) => player.id === id);

  const renderRound = (round: string) => (
    <div className={`mb-8 ${round === "finals" ? "flex justify-center" : ""}`}>
      {round !== "finals" && (
        <h2 className="text-center text-2xl font-bold capitalize mb-6 text-blue-700">
          {round.replace("-", " ")}
        </h2>
      )}
      <div
        className={`${
          round === "finals"
            ? "flex justify-around items-center space-x-12"
            : "grid grid-cols-1 md:grid-cols-2 gap-6"
        }`}
      >
        {matches
          .filter((match) => match.round === round)
          .map((match) => (
            <div
              key={match.id}
              className="p-8 rounded-lg shadow-lg hover:shadow-2xl transition border border-gray-700 flex flex-col items-center space-y-6"
            >
              <div className="flex justify-around w-full space-x-12">
                {/* Jogador 1 */}
                {match.player1Id && (
                  <div
                    onClick={() => setSelectedWinner({ matchId: match.id, winnerId: match.player1Id })}
                    className="cursor-pointer flex flex-col items-center space-y-2 hover:opacity-90 transition"
                  >
                    <img
                      src={getPlayer(match.player1Id)?.profileImage || "/placeholder.png"}
                      alt={getPlayer(match.player1Id)?.username || "TBD"}
                      className="w-20 h-20 rounded-full border-2 border-gray-700"
                    />
                    <span className="text-lg font-semibold text-white">
                      {getPlayer(match.player1Id)?.username || "TBD"}
                    </span>
                    {selectedWinner?.matchId === match.id && selectedWinner?.winnerId === match.player1Id && (
                      <div className="flex space-x-2 mt-2">
                        <button
                          onClick={() => confirmWinner(match.id, match.player1Id, 1)}
                          className="bg-green-600 text-white px-4 py-1 rounded-lg shadow-md hover:bg-green-700 transition"
                        >
                          ✅ Vitória
                        </button>
                        <button
                          onClick={() => confirmWinner(match.id, match.player1Id, 0.5)}
                          className="bg-gray-600 text-white px-4 py-1 rounded-lg shadow-md hover:bg-gray-700 transition"
                        >
                          🤝 Empate
                        </button>
                      </div>
                    )}
                  </div>
                )}
  
                {/* VS */}
                <span className="text-gray-400 text-2xl font-bold">vs</span>
  
                {/* Jogador 2 */}
                {match.player2Id && (
                  <div
                    onClick={() => setSelectedWinner({ matchId: match.id, winnerId: match.player2Id })}
                    className="cursor-pointer flex flex-col items-center space-y-2 hover:opacity-90 transition"
                  >
                    <img
                      src={getPlayer(match.player2Id)?.profileImage || "/placeholder.png"}
                      alt={getPlayer(match.player2Id)?.username || "TBD"}
                      className="w-20 h-20 rounded-full border-2 border-gray-700"
                    />
                    <span className="text-lg font-semibold text-white">
                      {getPlayer(match.player2Id)?.username || "TBD"}
                    </span>
                    {selectedWinner?.matchId === match.id && selectedWinner?.winnerId === match.player2Id && (
                      <div className="flex space-x-2 mt-2">
                        <button
                          onClick={() => confirmWinner(match.id, match.player2Id, 1)}
                          className="bg-green-600 text-white px-4 py-1 rounded-lg shadow-md hover:bg-green-700 transition"
                        >
                          ✅ Vitória
                        </button>
                        <button
                          onClick={() => confirmWinner(match.id, match.player2Id, 0.5)}
                          className="bg-gray-600 text-white px-4 py-1 rounded-lg shadow-md hover:bg-gray-700 transition"
                        >
                          🤝 Empate
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
  
  
  return (
    <div className="bg-gray-900 text-white p-10 rounded-3xl shadow-2xl space-y-12">
      {tournamentWinner ? (
        <div className="text-center">
          <Confetti recycle={false} />
          <h1 className="text-4xl font-extrabold">🏆 {tournamentWinner.username} venceu o torneio!</h1>
          <img
            src={tournamentWinner.profileImage || '/placeholder.png'} // Caminho da imagem ou imagem padrão
            alt={tournamentWinner.username}
            className="w-32 h-32 rounded-full mx-auto border-4 border-blue-500 mt-6 "
          />
        </div>
      ) : (
        <>
          <button onClick={initializeTournament} className="block mx-auto bg-blue-600 px-6 py-3 rounded-full text-white">
            Iniciar Torneio
          </button>
          {['quarter-finals', 'semi-finals', 'finals'].map(renderRound)}
        </>
      )}
    </div>
  );
}
