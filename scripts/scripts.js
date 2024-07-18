import { productsData } from "./products.js";


const cartBtn = document.querySelector(".cart-btn");
const Modalcart = document.querySelector(".cart");
const backdrop = document.querySelector(".backdrop");
const closeModal = document.querySelector(".confirm-cart-btn");
const productsDOM = document.querySelector(".products-center");
const totalPrice = document.querySelector(".total-price");
const cartItemNum = document.querySelector(".cart-item-num");
const cartIncludingsContainer = document.querySelector(".cart-product");
const clearCartBtn = document.querySelector(".clear-cart-btn");

let cart = [];
let buttonsDom = [];
// 1. get products
class Products {
    getProducts() {
        return productsData;
    }
}
// 2. display products
class UI {
    displayProducts(products) {
        let result = "";
        products.forEach((item) => {
            result += `<section class="product">
            <div class="img-conteinr">
              <img class="product-img" src="${item.imageUrl}" alt="p-1" />
            </div>
            <div class="product-description">
              <p class="product-title">${item.title}</p>
              <p class="product-price">${item.price}$</p>
            </div>
            <div class="btn-container">
              <button class="add-to-cart-btn" data-id=${item.id}>add to cart</button>
            </div>
          </section>`
        });
        productsDOM.innerHTML = result;

    }
    getAddToCartBtns() {
        const addToCartBtns = [...document.querySelectorAll(".add-to-cart-btn")];
        buttonsDom = addToCartBtns;
        addToCartBtns.forEach((btn) => {
            const btnId = btn.dataset.id;
            const isInCart = cart.find((p) => parseInt(p.id) === parseInt(btnId));
            if (isInCart) {
                btn.innerHTML = "In Cart";
                btn.disabled = true;
            }
            btn.addEventListener("click", (event) => {
                event.target.innerHTML = "In cart";
                event.target.disabled = true;
                // console.log(event.target.dataset.id);
                const addedProduct = { ...Storage.getProduct(btnId), quantity: 1 };
                cart = [...cart, addedProduct];

                Storage.saveCart(cart);

                this.setCartValue(cart);
                this.addCartItem(addedProduct);
            });
        });
    }

    setCartValue(cart) {
        let cartItems = 0;
        const totalCartPrice = cart.reduce((acc, curr) => {
            cartItems += curr.quantity;
            return acc + curr.quantity * curr.price;
        }, 0);
        totalPrice.innerHTML = `${totalCartPrice.toFixed(2)} $`;
        cartItemNum.innerHTML = cartItems;
    }

    addCartItem(cartItem) {
        const div = document.createElement("div");
        div.classList.add("cart-includings");
        div.innerHTML = `
        <div class="cart-img-container">
        <img class="p-image" src=${cartItem.imageUrl} alt="p-1" />
      </div>
      <div class="p-description">
        <p class="product-title">${cartItem.title}</p>
        <span class="product-price">${cartItem.price}</span>
      </div>
      <div class="cart-controller">
        <i class="fa-solid fa-arrow-up" data-id=${cartItem.id}></i>
        <span class="number-of-products bold">${cartItem.quantity}</span>
        <i class="fa-solid fa-arrow-down"data-id=${cartItem.id}></i>
      </div>
        <i class="fa-solid fa-trash-can" data-id=${cartItem.id}></i>
        `;
        cartIncludingsContainer.appendChild(div);
    }
    setUpApp() {
        // get cart from localstorage
        cart = Storage.getCart() || [];
        // add cart item
        cart.forEach((cartItem) => this.addCartItem(cartItem));
        // set values: price and num of items
        this.setCartValue(cart);
    }
    cartLogic() {
        // remove : (DRY) : Don't repeat yourself
        clearCartBtn.addEventListener("click", () => this.clearCart());
        // cart functionality 
        cartIncludingsContainer.addEventListener("click", (event) => {

            if (event.target.classList.contains("fa-arrow-up")) {
                // console.log(event.target.dataset.id);
                const incrementBtn = event.target;
                // 1. get item from cart
                const addedItem = cart.find((cItem) => cItem.id == incrementBtn.dataset.id);
                addedItem.quantity++;
                // 2. update cart value
                this.setCartValue(cart);
                // 3.save cart
                Storage.saveCart(cart);
                // 4. update cart item in ui
                incrementBtn.nextElementSibling.innerHTML = addedItem.quantity;
            } else if (event.target.classList.contains("fa-trash-can")) {
                const deleteBtn = event.target;
                const _deletedItem = cart.find((cItem) => cItem.id == deleteBtn.dataset.id);
                this.removeItem(_deletedItem.id);

                Storage.saveCart(cart);

                cartIncludingsContainer.removeChild(deleteBtn.parentElement);
            } else if (event.target.classList.contains("fa-arrow-down")) {
                const decrementBtn = event.target;
                const decrementedItem = cart.find((cItem) => cItem.id == decrementBtn.dataset.id);
                if (decrementedItem.quantity === 1) {
                    this.removeItem(decrementedItem.id);
                    cartIncludingsContainer.removeChild(decrementBtn.parentElement.parentElement);
                    return;
                }
                decrementedItem.quantity--;
                this.setCartValue(cart);
                Storage.saveCart(cart);

                decrementBtn.previousElementSibling.innerHTML = decrementedItem.quantity;
            }
        });


    }
    clearCart() {
        cart.forEach((cItem) => this.removeItem(cItem.id));

        // remove cart includings children 
        while (cartIncludingsContainer.children.length) {
            cartIncludingsContainer.removeChild(cartIncludingsContainer.children[0]);
        }
        closeModalFunction();
    }
    removeItem(id) {
        cart = cart.filter((cItem) => cItem.id !== id);
        // total price and items
        this.setCartValue(cart);
        // update local storage 
        Storage.saveCart(cart);

        // get add to cart btns => update text and disabled attr
        this.getSingleButton(id);
    }
    
    getSingleButton(id) {
        const button = buttonsDom.find((btn) => parseInt(btn.dataset.id) === parseInt(id));
        button.innerHTML = "add to cart";
        button.disabled = false;
    }
}
// 3.  storage
class Storage {
    static saveToLocalstorage(products) {
        localStorage.setItem("products", JSON.stringify(products));
    } // when we create a static method in a class => there is no need to get a new instance of that class
    // to get access to its method like other methods from other classes in the domcontentloaded section
    static getProduct(id) {
        const _products = JSON.parse(localStorage.getItem("products"));
        return _products.find((p) => p.id === parseInt(id));
    }
    static saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
    }
    static getCart() {
        return JSON.parse(localStorage.getItem("cart"));
    }
}

//  when DOM content is loaded 
document.addEventListener("DOMContentLoaded", () => {
    const products = new Products();
    const productsData = products.getProducts();
    const ui = new UI();
    ui.displayProducts(productsData);
    ui.getAddToCartBtns();
    // set up the app when refreshing
    ui.setUpApp();
    ui.cartLogic();
    //---------------
    Storage.saveToLocalstorage(productsData);
});



// show and close modal cart
function showModalFunction() {
    Modalcart.style.opacity = "1";
    backdrop.style.display = "block";
    Modalcart.style.top = "20%"
}

function closeModalFunction() {
    Modalcart.style.opacity = "0";
    backdrop.style.display = "none";
    Modalcart.style.top = "-100%";
}

cartBtn.addEventListener("click", showModalFunction);
closeModal.addEventListener("click", closeModalFunction);
backdrop.addEventListener("click", closeModalFunction);