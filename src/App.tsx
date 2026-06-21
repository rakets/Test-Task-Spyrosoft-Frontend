import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DailyMix {
  date: string;
  averageMix: Record<string, number>;
  cleanEnergyPercent: number;
}

export default function App() {
  const [mixData, setMixData] = useState<DailyMix[]>([]);
  const [loadingMix, setLoadingMix] = useState<boolean>(true);

  const API_BASE_URL = 'http://localhost:8080/api/energy';

  const COLORS: Record<string, string> = {
    biomass: '#04f05a', 
    nuclear: '#a855f7', 
    hydro: '#3b82f6',
    wind: '#0ea5e9',
    solar: '#eab308', 
    gas: '#f97316',
    coal: '#78716c', 
    imports: '#ef4444', 
    other: '#9ca3af'
  };


  // graphs
  useEffect(() => {
    axios.get<DailyMix[]>(`${API_BASE_URL}/mix`)
      .then(response => {
        setMixData(response.data);
        setLoadingMix(false);
      })
      .catch(error => {
        console.error("Błąd pobierania danych:", error);
        setLoadingMix(false);
      });
  }, []);

  
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>Charge in UK</h1>

      <section style={{ marginBottom: '50px' }}>
        <h2>Miks Energetyczny (3 Dni)</h2>
        
        {loadingMix ? (
          <p>Ładowanie danych z backendu...</p>
        ) : (
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {mixData.map((day, index) => {
              // Подготовка данных для recharts
              const chartData = Object.entries(day.averageMix)
                .filter(([_, value]) => value > 0)
                .map(([name, value]) => ({ name, value }));

              return (
                <div key={index} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', flex: '1 1 300px', backgroundColor: '#fff' }}>
                  <h3 style={{ textAlign: 'center', margin: '0 0 10px 0' }}>{day.date}</h3>
                  <p style={{ textAlign: 'center', color: '#16a34a', fontWeight: 'bold' }}>
                    Czysta energia: {day.cleanEnergyPercent}%
                  </p>
                  
                  <div style={{ height: '300px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%" minHeight={250}>
                      <PieChart>
                        <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={80} label>
                          {chartData.map((entry, i) => (
                            <Cell key={`cell-${i}`} fill={COLORS[entry.name] || COLORS.other} />
                          ))}
                        </Pie>
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}