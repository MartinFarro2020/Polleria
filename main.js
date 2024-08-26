const BASE_URL = "./pollobrasa.json";
/*http://localhost:3000/Pollos */
async function getProducts(){
    try {
        const data = await fetch(BASE_URL)
        const response = await data.json()
        localStorage.setItem("products",JSON.stringify(response))                                
        return response;
    } catch (error) {
        console.log(error);
    }
}

function validateAmountProduct(store,id){
    if(store.cart[id].amount === store.cart[id].stock){
        alert("Ya no hay mas en stock")
    }else{
        store.cart[id].amount++;
    }
} 

function printProducts(store){
    let html = "";
   
    store.products.forEach(function({id,categoria,nombre,url,stock,precio}){
        html += `
            <div class="product">
                <div class="product_img">
                    <img src="${url}" alt="" />
                </div>
                
                <p class="description">${categoria} - <b>${nombre}</b></p>
                <p>Precio: S/ ${precio}.0</p>
                <p>${stock}unidades</p>
                <button class="product_btn" id="${id}">Agregar</button>
            </div>
        `
        });
  
    document.querySelector(".products").innerHTML = html;
    
}

function handleShowCart(){
    const iconCart = document.querySelector(".icon_cart")
    const cart = document.querySelector(".cart")

    iconCart.addEventListener("click", function () {
        cart.classList.toggle("cart_show");
    });
}

function handleFilter(store,storeAux){
    const buttons= document.querySelectorAll(".buttons .btn");

    buttons.forEach(function (button) {
        button.addEventListener("click", function(e){
             const perro = e.target.id
             console.log(perro);
             
            if ( perro === "all"){
                printProducts(store);
            } else{
                    const newArray = store.products.filter(function(product){
                    console.log("aqui estoy");
                    return product.categoria === perro;
                })
                console.log(newArray);
                storeAux.products=newArray
                printProducts(storeAux);
                
            }
        });
    });
}

function paintProductsInCart(store){
    let html="";

    for(const key in store.cart){
       const {amount,id,nombre,categoria,precio,stock,url} = store.cart[key]
       console.log(store.cart[key]);
       html += `
       <div class="cart_product">
           <div class="cart_product_img">
               <img src="${url}" alt=""/>
           </div>
           <div class="cart_product_body">
                           <p>
                               <b>${categoria}</b>: <b>${nombre}</b>
                           </p>
                           <p>
                               <b>Precio:$${precio} || Total:$${amount*precio}</b>
                           </p>

                           <p>
                               <small>Disponibles ${stock}</small>
                           </p>
                           <div class="cart_product_opt" id="${id}">
                               <i class='bx bx-minus'></i>
                               <span>${amount}</span>
                               <i class='bx bx-plus'></i>
                               <i class='bx bxs-trash'></i>
                           </div>
           </div>
       </div>
       `;
   
   }
document.querySelector(".cart_products").innerHTML=html;
}

function addToCartFromToProduct(store){
    const productHTML = document.querySelector(".products")
    
    productHTML.addEventListener("click",function(e){
        if(e.target.classList.contains("product_btn")){
            const id = e.target.id
            const productFound=store.products.find(function(product){
                return product.id === id
            })
            
            if(store.cart[productFound.id]){
                validateAmountProduct(store,id)
            }else{
                store.cart[productFound.id] = {
                    ...productFound,
                    amount:1,
                }
            }

            localStorage.setItem("cart",JSON.stringify(store.cart))
            paintProductsInCart(store)
            printTotal(store)
        }
        
   })
  
}

function printTotal(store){
    let totalProducts = 0;
    let totalPrice = 0;

    for (const key in store.cart){
        const {amount,precio} = store.cart[key];

        totalProducts += amount;
        totalPrice += amount * precio;
    }    
        document.querySelector('#totalProducts').textContent = totalProducts;
        document.querySelector('#totalPrice').textContent = totalPrice;
        document.querySelector(".ball").textContent = totalProducts;
    
}

function handleCar(store){
    document
    .querySelector(".cart_products")
    .addEventListener("click",function(e){
        if (e.target.classList.contains("bx")){
            const id=Number(e.target.parentElement.id);

            if(e.target.classList.contains("bx-minus")){               
                if(store.cart[id].amount === 1){
                    const response= confirm("Seguro desea eliminar?")
                    if(response) delete store.cart[id]
                }else{
                    store.cart[id].amount--;
                }
            }

            if(e.target.classList.contains("bx-plus")){
                validateAmountProduct(store,id)
            }

            if(e.target.classList.contains("bxs-trash")){
                const response= confirm("Seguro desea eliminar?")
                if(response) delete store.cart[id]
            }

            localStorage.setItem("cart",JSON.stringify(store.cart))
            paintProductsInCart(store);
            printTotal(store)
        }
    })
}

function handleTotal(store){
    document.querySelector(".btn_buy").addEventListener("click",function(){
        if(!Object.values(store.cart).length) return alert("Y si primero compramos algo")
        const response = confirm("Seguro que quieres comprar?");
        if (!response) return;

        const newArray = [];
        
        store.products.forEach((product) => {
            if (store.cart[product.id]) {
                newArray.push({
                    ...product,
                    stock: product.stock - store.cart[product.id].amount
                });
            } else {
                newArray.push(product);
            }
        });

        store.products = newArray;
        store.cart = {};

        localStorage.setItem("products",JSON.stringify(store.products));
        localStorage.setItem("cart",JSON.stringify(store.cart));
       
        printProducts(store);
        paintProductsInCart(store);
        printTotal(store)
    });
}


async function main(){
    const store ={
        products: JSON.parse(localStorage.getItem("products"))|| 
                  (await getProducts()),
        cart: JSON.parse(localStorage.getItem("cart")) || {},
    }
    const storeAux = {
        products:{},
    }
    printProducts(store)
    handleShowCart()
    handleFilter(store,storeAux)
    addToCartFromToProduct(store)
    paintProductsInCart(store)
    handleCar(store)
    printTotal(store)
    handleTotal(store)
}

main();
