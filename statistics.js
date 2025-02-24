// statistics.js

async function calculateStatistics(data) {
    if (!data) {
        console.error('Data is null or undefined.');
        return null;
    }

    try {
        const mean = calculateMean(data);
        const median = await calculateMedian(data);
        const mode = calculateMode(data);
        const range = calculateRange(data);
        const standardDeviation = calculateStandardDeviation(data);
        const min = calculateMin(data);
        const max = calculateMax(data);

        return {
            mean,
            median,
            mode,
            range,
            standardDeviation,
            min,
            max
        };
    } catch (error) {
        console.error('Error calculating statistics:', error);
        return null;
    }
}

function calculateMean(data) {
    const sum = data.reduce((acc, val) => acc + val, 0);
    return sum / data.length;
}

async function calculateMedian(data) {
    const sortedData = data.slice().sort((a, b) => a - b);
    const middleIndex = Math.floor(sortedData.length / 2);
    if (sortedData.length % 2 === 0) {
        return (sortedData[middleIndex - 1] + sortedData[middleIndex]) / 2;
    } else {
        return sortedData[middleIndex];
    }
}

function calculateMode(data) {
    const counts = {};
    data.forEach(value => {
        counts[value] = (counts[value] || 0) + 1;
    });
    let mode;
    let maxCount = 0;
    for (const value in counts) {
        if (counts[value] > maxCount) {
            mode = value;
            maxCount = counts[value];
        }
    }
    return parseInt(mode);
}

function calculateRange(data) {
    const min = Math.min(...data);
    const max = Math.max(...data);
    return max - min;
}

function calculateStandardDeviation(data) {
    const mean = calculateMean(data);
    const squaredDifferences = data.map(value => (value - mean) ** 2);
    const variance = calculateMean(squaredDifferences);
    return Math.sqrt(variance);
}

function calculateMin(data) {
    return Math.min(...data);
}

function calculateMax(data) {
    return Math.max(...data);
}

window.calculateStatistics = calculateStatistics;
window.calculateMean = calculateMean;
    