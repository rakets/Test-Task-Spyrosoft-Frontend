import { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';

interface DailyMix {
  date: string;
  averageMix: Record<string, number>;
  cleanEnergyPercent: number;
}

interface OptimalWindow {
  start: string;
  end: string;
  avgCleanEnergyPercentage: number;
}

export default function App() {
  const [mixData, setMixData] = useState<DailyMix[]>([]);
  const [loadingMix, setLoadingMix] = useState<boolean>(true);

  const [hours, setHours] = useState<number>(3);
  const [optimalWindow, setOptimalWindow] = useState<OptimalWindow | null>(null);
  const [loadingWindow, setLoadingWindow] = useState<boolean>(false);
  const [error, setError] = useState<string>('');


  // const API_BASE_URL = 'http://localhost:8080/api/energy';
  const API_BASE_URL = 'https://test-task-spyrosoft.onrender.com/api/energy';

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

  // window
  const fetchOptimalWindow = () => {
    setLoadingWindow(true);
    setOptimalWindow(null); // cleaning before searching

    axios.get<OptimalWindow>(`${API_BASE_URL}/optimal-window/${hours}`)
      .then(response => {
        setOptimalWindow(response.data);
        setLoadingWindow(false);
      })
      .catch(err => {
        console.error("Błąd obliczania okna:", err);
        setError('Wystąpił błąd. Sprawdź backend.');
        setLoadingWindow(false);
      });
  };

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
              // preparing data for recharts
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

      {/* window */}
      <section style={{ borderTop: '2px solid #eee', paddingTop: '30px' }}>
        <h2>Optymalne okno ładowania</h2>
        
        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label>Czas ładowania (ilość godzin):</label>
          <input 
            type="number" 
            min="1" 
            max="6" 
            value={hours} 
            onChange={(e) => setHours(Number(e.target.value))}
            style={{ width: '60px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <button 
            onClick={fetchOptimalWindow} 
            disabled={loadingWindow}
            style={{ 
              padding: '8px 20px', 
              cursor: loadingWindow ? 'not-allowed' : 'pointer', 
              backgroundColor: loadingWindow ? '#9ca3af' : '#2563eb', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              fontWeight: 'bold'
            }}
          >
            {loadingWindow ? 'Szukanie...' : 'Szukaj'}
          </button>
        </div>

        {error && <p style={{ color: '#dc2626', fontWeight: 'bold' }}>{error}</p>}

        {/* window's result */}
        {optimalWindow && (
          <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '20px', borderRadius: '8px' }}>
            <h3 style={{ marginTop: 0, color: '#1e40af' }}>Lepszy moment dla ładowania:</h3>
            <p><strong>Datę, godzinę rozpoczęcia:</strong> {new Date(optimalWindow.start).toLocaleString('pl-PL')}</p>
            <p><strong>Datę, godzinę zakończenie:</strong> {new Date(optimalWindow.end).toLocaleString('pl-PL')}</p>
            <p><strong>Średni procent udziału czystej energii:</strong> {optimalWindow.avgCleanEnergyPercentage}%</p>
          </div>
        )}
      </section>

    </div>
  );
}
