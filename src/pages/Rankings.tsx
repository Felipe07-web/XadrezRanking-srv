import React, { useEffect, useState } from "react";
import { Trophy, Medal } from "lucide-react";
import { Player } from "../types";

export default function Rankings() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const BACKEND_URL = "https://xadrezranking-srv-production.up.railway.app";

  // Busca os jogadores no backend
  const fetchPlayers = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/players`);
      const data = await res.json();

      const sortedPlayers = data.sort((a: Player, b: Player) => b.points - a.points);
      setPlayers(sortedPlayers);
    } catch (error) {
      console.error("Erro ao buscar jogadores:", error);
    }
  };

  // Função para resetar os pontos
  const resetPoints = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/players/reset`, {
        method: "POST",
      });

      if (res.ok) {
        alert("Pontos resetados com sucesso!");
        fetchPlayers(); // Atualiza a lista
      } else {
        alert("Erro ao resetar os pontos.");
      }
    } catch (error) {
      console.error("Erro ao resetar pontos:", error);
      alert("Ocorreu um erro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  return (
    <div className="space-y-8 bg-gray-900 min-h-screen py-8 px-4 md:px-16">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-400 mb-2">Chess Masters Rankings</h1>
        <p className="text-gray-400 text-lg">Veja o ranking atualizado dos melhores jogadores</p>
      </div>

      {/* Top 3 Jogadores */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-6">
        {players.slice(0, 3).map((player, index) => (
          <div
            key={player.id}
            className="flex flex-col items-center bg-gray-700 rounded-lg shadow-lg p-6 w-48 md:w-56"
          >
            {index === 0 && <Trophy className="h-12 w-12 text-yellow-400 mb-2" />}
            {index === 1 && <Medal className="h-12 w-12 text-gray-300 mb-2" />}
            {index === 2 && <Medal className="h-12 w-12 text-amber-600 mb-2" />}

            <img
              src={player.profileImage || "/placeholder.png"}
              alt={player.username}
              className="h-16 w-16 rounded-full object-cover border-2 border-gray-500 mb-2"
            />
            <h3 className="text-lg md:text-xl font-semibold text-white">{player.username}</h3>
            <p className="text-lg md:text-2xl text-blue-400 font-bold">
              Pontos: {player.points.toFixed(1)}
            </p>
          </div>
        ))}
      </div>

      {/* Lista Completa */}
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 md:p-8">
        <div className="grid grid-cols-1 gap-4">
          {players.slice(3).map((player, index) => (
            <div
              key={player.id}
              className="flex items-center space-x-4 p-4 md:p-6 bg-gray-700 rounded-lg shadow hover:shadow-xl transition"
            >
              <div className="flex-shrink-0 text-center w-12">
                <span className="text-xl md:text-2xl font-semibold text-gray-400">{index + 4}</span>
              </div>
              <div className="flex-shrink-0">
                <img
                  src={player.profileImage || "/placeholder.png"}
                  alt={player.username}
                  className="h-12 w-12 md:h-16 md:w-16 rounded-full object-cover border-2 border-gray-600"
                />
              </div>

              <div className="flex-1">
                <h3 className="text-lg md:text-xl font-semibold text-white">{player.username}</h3>
                <p className="text-lg md:text-2xl text-blue-400 font-bold">
                  Pontos: {player.points.toFixed(1)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
