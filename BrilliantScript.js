/** SO THIS IS GONNA BE A FAKE API , for all checking out the code its from DUMMYJSON and its the format our database information needs to come in on order for the web app to work! it must be hosted live , if you can host it on my own domain and then pull the information like this :  fetch('myportfolio.com/projects/DATABASEINFO')  It should be pushed into json format and then us*/



let cart = JSON.parse(localStorage.getItem("BrilliantCart")) || [];

function saveCart() {
  localStorage.setItem("BrilliantCart", JSON.stringify(cart));
}

function getPrice(food) {
    return food.price;
  }

const isMenuPage = document.querySelector("#FoodItems") !== null;
const isCartPage = document.querySelector("#CartItems") !== null;

if (isMenuPage) initMenu();
if (isCartPage) initCart();


function initMenu() {
  let recipes = [];
  let selectedFood = null;
  const modal = document.querySelector("#Modal");

  /* START SCREEN i was going to impliment GSAP but decided agaisnt it */
  const startButton = document.querySelector(".StartButton");
  const startScreen = document.querySelector(".StartScreenOverlay");
  if (startButton && startScreen) {
    startButton.addEventListener("click", () => {
      startScreen.classList.add("slide-up");
    });
  }

  /* it just adds an X because i sisnt feel like styling it  */
  function closeModal() {
    modal.style.display = "none";
  }

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "×";
  closeBtn.className = "ModalClose";
  closeBtn.setAttribute("aria-label", "Close");
  closeBtn.style.cssText =
    "position:absolute;top:8px;right:12px;background:none;border:none;" +
    "font-size:28px;line-height:1;cursor:pointer;";
  closeBtn.onclick = closeModal;
  modal.prepend(closeBtn);
  /* totally got the css from chat full transparency  */

  /* DATA (DummyJSON for now; swap in your own domain later) 
  fetch("https://dummyjson.com/recipes?limit=50")
    .then(response => response.json())
    .then(data => {
      recipes = data.recipes;
      displayFood(recipes);
    })
    .catch(error => console.log("Error loading recipes:", error));

    */
  // THIS IS THE PROPER DATABASE, HOWEVER IT NEEDS PICTURES
  fetch("data/menu.json")
  .then(response => response.json())
  .then(data => {
    recipes = data.recipes;
    displayFood(recipes);
  })
  
  .catch(error => console.log("Error loading recipes:", error));
  /* FOOD CARDS */
  function displayFood(foodList) {
    function openModal(food) {
        selectedFood = food;
      
        modal.querySelector("h1").textContent = food.name;
        modal.querySelector("h3").textContent = food.ingredients.join(", ");
        modal.querySelector("#Price").textContent = "$" + getPrice(food).toFixed(2);
        modal.querySelector("img").src = food.image;
        modal.querySelector("#Adjuster #value").textContent = "1";
        modal.style.display = "block";
      }
    const foodContainer = document.querySelector("#FoodItems");

    foodContainer.innerHTML = foodList.map(food => `
      <div class="FoodCard">
        <img src="${food.image}" alt="${food.name}">
        <p>${food.name}</p>
        <p>$${getPrice(food).toFixed(2)}</p>
      </div>
    `).join("");

    foodContainer.querySelectorAll(".FoodCard").forEach((card, index) => {
      card.onclick = () => openModal(foodList[index]);
    });
  }

  /* CATEGORY FILTERING */document.querySelectorAll("#FoodFilter #GenreSelector").forEach(category => {
  category.onclick = () => {
    const name = category.textContent.trim().toLowerCase();
    const hasTag = (food, word) =>
      food.tags.some(tag => tag.toLowerCase().includes(word));

    if (name.includes("meal")) {
      displayFood(recipes);
    }
    else if (name.includes("chicken")) {
      displayFood(recipes.filter(food =>
        hasTag(food, "chicken") || food.name.toLowerCase().includes("chicken")
      ));
    }
    else if (name.includes("dessert") || name.includes("desert")) {
      displayFood(recipes.filter(food => hasTag(food, "dessert")));
    }
    else if (name.includes("burger")) {
      displayFood(recipes.filter(food =>
        hasTag(food, "burger") || food.name.toLowerCase().includes("burger")
      ));
    }
    else if (name.includes("side")) {
      displayFood(recipes.filter(food => hasTag(food, "side")));
    }
    else if (name.includes("drink")) {
      displayFood(recipes.filter(food => hasTag(food, "drink")));
    }
  };
});

  /* MODAL QUANTITY BUTTONS */
  document.querySelectorAll("#Modal #Adjuster button").forEach(button => {
    button.onclick = () => {
      const value = document.querySelector("#Modal #Adjuster #value");
      let quantity = Number(value.textContent);

      if (button.textContent.includes("+")) {
        quantity++;
      } else {
        quantity = Math.max(1, quantity - 1);
      }

      value.textContent = quantity;
    };
  });

  /* ADD TO CART */
  document.querySelector("#panelSubmit button").onclick = () => {
    if (!selectedFood) return;

    const quantity = Number(document.querySelector("#Modal #Adjuster #value").textContent);
    const existingItem = cart.find(item => item.id === selectedFood.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        id: selectedFood.id,
        name: selectedFood.name,
        price: getPrice(selectedFood),
        image: selectedFood.image,
        quantity: quantity
      });
    }

    displayCart();
    closeModal();
  };

  /* RECEIPT */
  function displayCart() {
    const cartContainer = document.querySelector("#cart");

    cartContainer.innerHTML = cart.map(item => `
      <div id="RecieptItem">
        <img src="${item.image}" alt="${item.name}">
        <p>${item.name}</p>
        <p>$${item.price.toFixed(2)}</p>

        <div id="Adjuster">
          <button data-action="minus" data-id="${item.id}">-</button>
          <p id="value">${item.quantity}</p>
          <button data-action="plus" data-id="${item.id}">+</button>
        </div>

        <hr>
      </div>
    `).join("");

    updateTotal();
  }

  /* Receipt + / - buttons (event delegation) */
  document.querySelector("#cart").addEventListener("click", event => {
    const button = event.target.closest("button");
    if (!button) return;

    const item = cart.find(item => item.id == button.dataset.id);
    if (!item) return;

    if (button.dataset.action === "plus") {
      item.quantity++;
    }

    if (button.dataset.action === "minus") {
      item.quantity--;
      if (item.quantity <= 0) {
        cart = cart.filter(food => food.id != item.id);
      }
    }

    displayCart();
  });

  /* TOTAL (also saves the cart) */
  function updateTotal() {
    saveCart();
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    document.querySelector("#HeadToCart h3").textContent = "$" + total.toFixed(2);
  }

  /* REVIEW CART → cart.html */
  document.querySelector("#ReviewCart").onclick = () => {
    if (cart.length === 0) return;
    saveCart();
    window.location.href = "cart.html";
  };

  /* Restore receipt on page load */
  displayCart();
}


function initCart() {
  const cartItemsEl = document.querySelector("#CartItems");
  const submitButton = document.querySelector("#SubmitOrder");

  /* TAX: random 0% to 5%, same for this browser session */
  let taxRate = Number(sessionStorage.getItem("BrilliantTaxRate"));

  if (!sessionStorage.getItem("BrilliantTaxRate")) {
    taxRate = Math.random() * 5;
    sessionStorage.setItem("BrilliantTaxRate", taxRate);
  }

  function renderCart() {
    if (cart.length === 0) {
      cartItemsEl.innerHTML = "<p>Your cart is empty.</p>";
    } else {
      cartItemsEl.innerHTML = cart.map(item => `
        <div class="CartItem">
          <img src="${item.image}" alt="${item.name}">
          <div class="CartItemInfo">
            <p>${item.name}</p>
            <p>Qty: ${item.quantity}</p>
          </div>
          <p>$${(item.price * item.quantity).toFixed(2)}</p>
        </div>
      `).join("");
    }

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax;

    document.querySelector("#CartSubtotal").textContent = "$" + subtotal.toFixed(2);
    document.querySelector("#CartTaxRate").textContent = taxRate.toFixed(2);
    document.querySelector("#CartTax").textContent = "$" + tax.toFixed(2);
    document.querySelector("#CartTotal").textContent = "$" + total.toFixed(2);
  }

  submitButton.onclick = () => {
    if (cart.length === 0) return;

    alert("Order submitted! Thank you.");

    localStorage.removeItem("BrilliantCart");
    sessionStorage.removeItem("BrilliantTaxRate");
    window.location.href = "index.html";
  };

  renderCart();
}

//GSAP ANIMATIONS: 
if (typeof gsap !== "undefined") {
    const isMenu = document.querySelector("#FoodItems") !== null;
    const isCart = document.querySelector("#CartItems") !== null;
  
    if (isMenu) {
      /* Start screen intro */
      gsap.from(".StartScreenOverlay h1, .StartScreenOverlay img, #TL1, #TL2", {
        opacity: 0,
        y: 20,
        stagger: 0.15,
        duration: 0.8,
        ease: "power2.out"
      });
  
      /* Menu fades in after Start is clicked */
      document.querySelector(".StartButton").addEventListener("click", () => {
        gsap.from(".MainContent nav, .MainContent .content", {
          opacity: 0,
          y: 12,
          stagger: 0.1,
          duration: 0.8,
          delay: 0.6,
          ease: "power2.out"
        });
      });
  
      /* Category buttons stagger in */
      gsap.from("#FoodFilter #GenreSelector", {
        opacity: 0,
        y: 15,
        stagger: 0.08,
        duration: 0.4,
        delay: 0.6,
        ease: "power2.out"
      });
  
      /* Food cards animate in whenever displayFood() replaces them */
      const foodItems = document.querySelector("#FoodItems");
  
      new MutationObserver(mutations => {
        const cards = mutations
          .flatMap(m => [...m.addedNodes])
          .filter(node => node.classList && node.classList.contains("FoodCard"));
  
        if (cards.length) {
          gsap.from(cards, {
            opacity: 0,
            y: 20,
            duration: 0.35,
            stagger: 0.04,
            ease: "power2.out",
            clearProps: "transform,opacity"
          });
        }
      }).observe(foodItems, { childList: true });
  
      /* Food card hover lift */
      foodItems.addEventListener("mouseover", e => {
        const card = e.target.closest(".FoodCard");
        if (card) gsap.to(card, { scale: 1.03, duration: 0.2, ease: "power1.out" });
      });
  
      foodItems.addEventListener("mouseout", e => {
        const card = e.target.closest(".FoodCard");
        if (card && !card.contains(e.relatedTarget)) {
          gsap.to(card, { scale: 1, duration: 0.2, ease: "power1.out" });
        }
      });
  
      /* Category press effect */
      document.addEventListener("click", e => {
        const genre = e.target.closest("#FoodFilter #GenreSelector");
        if (genre) {
          gsap.fromTo(genre, { scale: 0.94 }, { scale: 1, duration: 0.35, ease: "back.out(2)" });
        }
      });
  
      /* Small press effect on every button, including ones created later */
      document.addEventListener("pointerdown", e => {
        const btn = e.target.closest("button");
        if (btn && btn.closest("#Modal, #Reciept")) return;
                if (btn) {
          gsap.fromTo(btn, { scale: 0.93 }, { scale: 1, duration: 0.2, ease: "power1.out" });
        }
      });
  
      /* Modal fades in when it opens */
      const modal = document.querySelector("#Modal");
      let modalWasOpen = false;
      
      new MutationObserver(() => {
        const isOpen = modal.style.display === "block";
      
        if (isOpen && !modalWasOpen) {
          gsap.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power1.out" });
          gsap.from("#Modal > *", {
            opacity: 0,
            y: 12,
            stagger: 0.04,
            duration: 0.3,
            delay: 0.05,
            ease: "power2.out"
          });
        }
      
        modalWasOpen = isOpen;
      }).observe(modal, { attributes: true, attributeFilter: ["style"] });
      /* Receipt items slide in when the cart changes */
      new MutationObserver(() => {
        gsap.from("#cart > #RecieptItem", {
          opacity: 0,
          x: 16,
          duration: 0.3,
          stagger: 0.05,
          ease: "power2.out"
        });
      }).observe(document.querySelector("#cart"), { childList: true });
  
      /* Total gives a small bump when it changes */
      const totalEl = document.querySelector("#HeadToCart h3");
  
      new MutationObserver(() => {
        gsap.fromTo(totalEl, { scale: 1.15 }, { scale: 1, duration: 0.4, ease: "back.out(2)" });
      }).observe(totalEl, { childList: true, characterData: true, subtree: true });
    }
  
    if (isCart) {
      gsap.from(".CartPage h1", { opacity: 0, y: -10, duration: 0.5, ease: "power2.out" });
  
      gsap.from(".CartPanel", {
        opacity: 0,
        y: 30,
        duration: 0.6,
        ease: "power3.out"
      });
  
      /* Cart items stagger in when rendered */
      new MutationObserver(() => {
        gsap.from("#CartItems > .CartItem", {
          opacity: 0,
          x: -15,
          stagger: 0.08,
          duration: 0.4,
          ease: "power2.out"
        });
      }).observe(document.querySelector("#CartItems"), { childList: true });
  
      /* Gentle glow on the Submit button */
      gsap.to("#SubmitOrder", {
        boxShadow: "0 0 0 8px rgba(254, 192, 8, 0.25)",
        duration: 1.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }
  }
