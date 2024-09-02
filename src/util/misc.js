export const FormatDateToUS = (date = new Date()) => {
    const options = {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    };

    const timeOptions = {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    };

    return `${date.toLocaleDateString('en-US', options)} ${date.toLocaleTimeString('en-US', timeOptions)}`;
};