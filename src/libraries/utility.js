const generateRandomNumber = () => {
    return parseInt(Math.random() * 1000000000, 10);
};

module.exports = {
    generateRandomNumber
};
