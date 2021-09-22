/**
 * @module logger
 * @version 0.0.1
 */
export default class Logger {
    /**
     * logging
     * Look at the function's below
     */
    logging({
        type = "log", 
        title = DrApi.name.full, 
        input = undefined, 
        color = "red"
    }) {
        console[type](`%c[${title}]%c`, `font-weight: bold; color: ${color}`, "", (typeof input === "object") ? [...input][0] : input)
    }
    /**
     * log
     * @param {string} title Title of the log
     * @param  {...any} logs What to log
     */
    get log() {
        return (title, ...logs) => this.logging({
            type: "log", 
            title: title, 
            input: logs
        })
    }
    /**
     * wanr
     * @param {string} title Title of the error
     * @param  {...any} warns What to warn
     */
    get warn() {
        return (title, ...warns) => this.logging({
            type: "warn", 
            title: title, 
            input: warns
        })
    }
    /**
     * error
     * @param {string} title Title of the error
     * @param  {...any} errors What to error
     */
    get error() {
        return (title, ...errors) => this.logging({
            type: "error", 
            title: title, 
            input: errors
        })
    }
}