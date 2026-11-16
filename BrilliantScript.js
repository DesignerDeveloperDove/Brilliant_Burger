/** SO THIS IS GONNA BE A FAKE API , for all checking out the code its from DUMMYJSON and its the format our database information needs to come in on order for the web app to work! it must be hosted live , if you can host it on my own domain and then pull the information like this :  fetch('myportfolio.com/projects/DATABASEINFO')  It should be pushed into json format and then us*/
let cart = JSON.parse(localStorage.getItem("BrilliantCart")) || [];

function saveCart() {
  localStorage.setItem("BrilliantCart", JSON.stringify(cart));
}

function getPrice(food) {
  return 6.99 + (food.caloriesPerServing / 1000);
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

  /* MODAL CLOSE (X) */
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

  /* DATA (DummyJSON for now; swap in your own domain later) */
  fetch("https://dummyjson.com/recipes?limit=50")
    .then(response => response.json())
    .then(data => {
      recipes = data.recipes;
      displayFood(recipes);
    })
    .catch(error => console.log("Error loading recipes:", error));

  /* FOOD CARDS */
  function displayFood(foodList) {
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

  /* CATEGORY FILTERING */
  document.querySelectorAll("#FoodGenres #GenreSelector").forEach(category => {
    category.onclick = () => {
      const name = category.textContent.toLowerCase();

      if (name.includes("meals")) {
        displayFood(recipes);
      }
      else if (name.includes("chicken")) {
        displayFood(recipes.filter(food =>
          food.tags.some(tag => tag.toLowerCase().includes("chicken")) ||
          food.name.toLowerCase().includes("chicken")
        ));
      }
      else if (name.includes("desert") || name.includes("dessert")) {
        displayFood(recipes.filter(food =>
          food.tags.some(tag => tag.toLowerCase().includes("dessert"))
        ));
      }
      else if (name.includes("burger")) {
        displayFood(recipes.filter(food =>
          food.name.toLowerCase().includes("burger") ||
          food.tags.some(tag => tag.toLowerCase().includes("burger"))
        ));
      }
      else if (name.includes("sides")) {
        displayFood(recipes.filter(food =>
          food.tags.some(tag => tag.toLowerCase().includes("side"))
        ));
      }
      else if (name.includes("drinks")) {
        displayFood([]);
      }
    };
  });

  /* OPEN MODAL */
  function openModal(food) {
    selectedFood = food;

    modal.querySelector("h1").textContent = food.name;
    modal.querySelector("h3").textContent = food.ingredients.join(", ");
    modal.querySelector("#Price").textContent = "$" + getPrice(food).toFixed(2);
    modal.querySelector("#Adjuster #value").textContent = "1";

    modal.style.display = "block";
  }

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