import React from "react";
import "./priceChart.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { PriceHistory } from "../../interfaces/PriceHistory";

type Props = {
  priceHistory: PriceHistory[]
  includeBonus: boolean
}

const PriceChart = ({ priceHistory, includeBonus }: Props) => {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const item = items[context.dataIndex];

            const tooltipText = [` €${item.price}`];

            if (item.isBonus) {
              tooltipText.push('Bonus:');
              tooltipText.push(`${item.bonusMechanism}`);
            }

            return tooltipText;
          }
        }
      }
    },
    scales: {
      y: {
        ticks: {
          // Include a euro sign and pad to 2 decimals if necessary
          callback: (value: string | number) => '€' + parseFloat(value.toString()).toFixed(2)
        }
      }
    },
  };

  const items = priceHistory
    .filter(hist => includeBonus ? true : !hist.isBonus)
    .filter((hist, pos, arr) => {
      return pos === 0 || hist.price !== arr[pos - 1].price
    })

  const labels = items.map(hist => new Date(hist.from).toISOString().slice(0, 10));

  const data = {
    labels,
    datasets: [
      {
        label: 'Prijs',
        data: items.map(hist => `${hist.price}`),
        borderColor: 'darkred',
        backgroundColor: 'darkred',
        pointBackgroundColor: items.map(hist => hist.isBonus ? '#00aaff' : 'darkred'),
        pointBorderColor: items.map(hist => hist.isBonus ? '#00aaff' : 'darkred'),
        pointRadius: items.map(hist => hist.isBonus ? 5 : 4),
      },
    ],
  };

  return (
    <Line options={options} data={data} />
  );
};

export default PriceChart;
