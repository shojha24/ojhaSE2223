// GRaph CSV with Chart.JS

async function getData() {
    const response = await fetch("researchData.csv")
    const data = await response.text()          //CSV in TEXT format

    const table = data.split('\r\n').slice(1);  // split by line and remove 0th row.
    console.log(table);

    const xVals = []; // x-axis labels = year vals
    const yCon = []; // y-axis labels = temp vals
    const yExp = [];

    table.forEach(row => {
        const columns = row.split(',');         // split each row into individual columns
        const num = columns[0];                // assign year value
        xVals.push(num);                      // push year val to big boy array

        const control = columns[1];    // global temp deviation
        yCon.push(control);                 // push temp val to big boy array

        const experimental = columns[2];              // northern hemisphere temp
        yExp.push(experimental);
    })

    return {xVals, yCon, yExp};
}

async function createChart() {
    const data = await getData();                            // waiting for getData to process, so that array vals are filled

    const ctx = document.getElementById('myChart');     // Configured for chart.JS 3.x and above
    const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.xVals,
            datasets: [{
                label: `Control Accuracy (%)`,
                data: data.yCon,
                backgroundColor: 'rgba(83, 86, 91, 1)',
                borderWidth: 1
            }, 
            {
                label: `Experimental Accuracy (%)`,
                data: data.yExp,
                backgroundColor: 'rgba(120, 78, 29, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,                   // Re-size based on screen size
            scales: {                           // x & y axes display options
                x: {
                    title: {
                        display: true,
                        text: 'Trial #',
                        font: {
                            size: 20
                        },
                    },
                },
                y: {
                    beginAtZero: false,
                    grace: "20%",
                    max: 100,
                    title: {
                        display: true,
                        text: 'Accuracy (%)',
                        font: {
                            size: 20
                        },
                    },
                    ticks: {
                        maxTicksLimit: data.yCon.length
                    }
                }
            },
            plugins: {                          // title and legend display options
                title: {
                    display: true,
                    text: `Final Accuracies of Image-Trained and Audio-Trained Algorithms`,
                    font: {
                        size: 24
                    },
                    padding: {
                        top: 10,
                        bottom: 30
                    },
                    color: 'rgba(135, 76, 31, 1)'
                },
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

createChart();