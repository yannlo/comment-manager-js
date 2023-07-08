/**
 * 
 * @param {string} messsage 
 * @param {string} type 
 * @returns {HTMLElement}
 */
export function alertElement(message, type = "danger"){

    /** @type {HTMLElement} */
    const alert = document
        .querySelector("#alert")
        .content
        .firstElementChild
        .cloneNode(true);
    alert.classList.add(`alert-${type}`)
    alert.querySelector(".js-text").innerText = message;
    alert.querySelector("button").addEventListener('click', e => {
        e.preventDefault();
        alert.remove();
        alert.dispatchEvent(
            new CustomEvent('closed')
        )
    })

    return alert;
}