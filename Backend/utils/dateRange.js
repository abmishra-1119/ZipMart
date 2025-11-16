export const getDateRange = (range) => {
    const now = new Date();
    let startDate;

    switch (range) {
        case "7d":
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
        case "30d":
            startDate = new Date(now.setDate(now.getDate() - 30));
            break;
        case "90d":
            startDate = new Date(now.setDate(now.getDate() - 90));
            break;
        case "1y":
            startDate = new Date(now.setFullYear(now.getFullYear() - 1));
            break;
        default:
            startDate = null; // No filter
    }

    return startDate;
};