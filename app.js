import { alertElement } from "./functions/alert.js"
import { fetchJSON } from "./functions/api.js"

class InfinitePaginaion{
    
    /** @type {HTMLElement} */
    #loader

    /** @type {string} */
    #endpoint

    /** @type {HTMLTemplateElement} */
    #template

    /** @type {HTMLElement} */
    #target

    /** @type {string} */
    #elements

    /** @type {IntersectionObserver} */
    #observer

    /** @type {boolean} */
    #loading = false

    /** @type {number} */
    #page = 1

    
    /**
     * 
     * @param {HTMLElement} elt 
     */
    constructor(elt){
        this.#loader = elt;
        this.#endpoint = elt.dataset.endpoint;
        this.#template = document.querySelector(elt.dataset.template);
        this.#target = document.querySelector(elt.dataset.target);
        this.#elements = JSON.parse(elt.dataset.elements);
        this.#observer = new IntersectionObserver((entries) =>{
            for(const entry of entries){
                if(entry.isIntersecting) {
                    this.#loadMore()
                }
            }
        })

        this.#observer.observe(elt);
    }


    async #loadMore () {
        if(this.#loading){
            return;
        }
        this.#loading = true;
        try {
            const url = new URL(this.#endpoint)
            url.searchParams.set("_page", this.#page)
            const comments = await fetchJSON(url.toString())
            if( comments.length === 0 ){
                this.#observer.unobserve(this.#loader);
                this.#loader.remove();1
                return;
            }
            for (const comment of comments) {
                const commentElt = this.#template.content.cloneNode(true)
                for(const [key, selector] of Object.entries(this.#elements)){
                    commentElt.querySelector(selector).innerText = comment[key]
                }
                this.#target.append(commentElt);
            }
            this.#page++;
        } catch (e) {
            this.#loader.style.display = "none";
            const error = alertElement('Impossible de charger les contenus')
            error.addEventListener("closed",e => {
                this.#loader.style.removeProperty("display")
            })
            this.#target.append(error);
        }finally{
            this.#loading = false;
        }
    } 
}

class fetchForm {
    
    /** @type {string} */
    #endpoint

    /** @type {HTMLTemplateElement} */
    #template

    /** @type {HTMLElement} */
    #target

    /** @type {string} */
    #elements
    
    /**
     * 
     * @param {HTMLFormElement} form 
     */
    constructor(form){
        this.#endpoint = form.dataset.endpoint;
        this.#template = document.querySelector(form.dataset.template);
        this.#target = document.querySelector(form.dataset.target);
        this.#elements = JSON.parse(form.dataset.elements);

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.#submitForm(e.currentTarget);
        })
    }

    /**
     * 
     * @param {HTMLFormElement} form 
     */
    #submitForm = async (form) => {
        const button = form.querySelector('button');
        button.setAttribute('disabled', '')
        try {
            const data = new FormData(form);
            const comment = await fetchJSON(this.#endpoint,{
                method: 'POST',
                json: Object.fromEntries(data)
            })
            const commentElt = this.#template.content.cloneNode(true)
            for(const [key, selector] of Object.entries(this.#elements)){
                commentElt.querySelector(selector).innerText = comment[key]
            }            
            this.#target.prepend(commentElt);
            form.reset()
            button.removeAttribute("disabled")
            form.insertAdjacentElement(
                "beforebegin",
                alertElement('Ajout de contenu effectuer', 'success')
            )
        } catch (e) {
            const error = alertElement('Impossible de soumettre le formulaire')
            form.insertAdjacentElement(
                "beforebegin",
                error
            )
            error.addEventListener("closed",e => {
                button.removeAttribute("disabled")
            })
        }
    }
}

document
    .querySelectorAll(".js-infinite-pagination")
    .forEach(pagination => new InfinitePaginaion(pagination))

document
    .querySelectorAll(".js-form-fetch")
    .forEach(form => new fetchForm(form))