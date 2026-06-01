document.addEventListener("DOMContentLoaded", function() {
    // ⚠️ БУЛ ЖЕРГЕ ӨЗҮҢДҮН НОМЕРИҢДИ ЖАЗ
    const myWhatsAppNumber = "996700123456"; 
    
    const firebaseUrl = "https://trendshop-db-default-rtdb.europe-west1.firebasedatabase.app/products.json";

    const productsContainer = document.getElementById("products-container");
    const cartCountElement = document.getElementById("cart-count");
    const cartIcon = document.querySelector(".cart-icon");
    const cartModal = document.getElementById("cart-modal");
    const closeCartBtn = document.getElementById("close-cart-btn");
    const cartItemsContainer = document.getElementById("cart-items-container");
    const cartTotalPriceElement = document.getElementById("cart-total-price");
    const emptyCartText = document.getElementById("empty-cart-text");
    const whatsappOrderBtn = document.getElementById("whatsapp-order-btn");

    let cartList = [];

    // 1. FIREBASE'ДЕН ТОВАРЛАРДЫ АЛУУ ЖАНА КӨРСӨТҮҮ
    function loadProductsFromFirebase() {
        if (productsContainer) productsContainer.innerHTML = "<p style='color:white; text-align:center; grid-column:1/-1;'>Товарлар жүктөлүүдө... 📥</p>";

        fetch(firebaseUrl)
        .then(response => response.json())
        .then(data => {
            if (productsContainer) productsContainer.innerHTML = "";
            
            if (!data) {
                if (productsContainer) {
                    productsContainer.innerHTML = `<p class="no-products" style="color:#64748b; text-align:center; grid-column: 1/-1; padding: 40px 0;">Дүкөндө азырынча товар жок...</p>`;
                }
                return;
            }

            // Firebase маалыматтарын объекттен тизмеге айландырып чыгаруу
            Object.keys(data).forEach(key => {
                const product = data[key];
                displayProduct(product);
            });
        })
        .catch(error => {
            console.error("Базадан жүктөөдө ката:", error);
        });
    }

    function displayProduct(product) {
        const productCard = document.createElement("div");
        productCard.classList.add("product-card");
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.title}">
            <div class="product-info">
                <h3>${product.title}</h3>
                <p class="price">${product.price} сом</p>
                <p class="desc">Категория: ${product.category}. Жеткирүү 7-15 күн.</p>
                <button class="buy-btn dynamic-buy-btn">🛒 Корзинага кошуу</button>
            </div>
        `;
        
        if (productsContainer) {
            productsContainer.insertBefore(productCard, productsContainer.firstChild);
        }

        const buyBtn = productCard.querySelector(".dynamic-buy-btn");
        if (buyBtn) {
            buyBtn.addEventListener("click", function() {
                cartList.push(product);
                updateCartUI();

                buyBtn.textContent = "Кошулду ✓";
                buyBtn.style.backgroundColor = "#25D366";
                buyBtn.style.color = "#ffffff";
                setTimeout(() => {
                    buyBtn.textContent = "🛒 Корзинага кошуу";
                    buyBtn.style.backgroundColor = "";
                    buyBtn.style.color = "";
                }, 1000);
            });
        }
    }

    // 2. КОРЗИНАНЫН ИЧИ (КРЕСТИК ОҢ ТАРАПТА)
    function updateCartUI() {
        if (cartCountElement) cartCountElement.textContent = cartList.length;
        if (!cartItemsContainer) return;
        cartItemsContainer.innerHTML = "";

        if (cartList.length === 0) {
            if (emptyCartText) emptyCartText.style.display = "block";
            if (cartTotalPriceElement) cartTotalPriceElement.textContent = "0 сом";
            return;
        }

        if (emptyCartText) emptyCartText.style.display = "none";
        let total = 0;

        cartList.forEach((item, index) => {
            total += parseInt(item.price);
            
            const itemRow = document.createElement("div");
            itemRow.style.display = "flex";
            itemRow.style.justify = "space-between";
            itemRow.style.alignItems = "center";
            itemRow.style.background = "#080c14";
            itemRow.style.padding = "10px";
            itemRow.style.borderRadius = "8px";
            itemRow.style.marginBottom = "8px";
            
            itemRow.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px; width: 80%;">
                    <img src="${item.image}" style="width: 45px; height: 45px; object-fit: cover; border-radius: 6px; flex-shrink: 0;">
                    <div style="overflow: hidden;">
                        <h4 style="color: white; font-size: 14px; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.title}</h4>
                        <span style="color: #00f2fe; font-size: 13px; font-weight: 600;">${item.price} сом</span>
                    </div>
                </div>
                <button class="remove-from-cart" data-index="${index}" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 16px; padding: 5px; flex-shrink: 0;">❌</button>
            `;
            
            cartItemsContainer.appendChild(itemRow);

            itemRow.querySelector(".remove-from-cart").addEventListener("click", function() {
                cartList.splice(index, 1);
                updateCartUI();
            });
        });

        if (cartTotalPriceElement) cartTotalPriceElement.textContent = total + " сом";
    }

    // 3. МОДАЛДЫК ТЕРЕЗЕ ЖАНА WHATSAPP
    if (cartIcon && cartModal) {
        cartIcon.addEventListener("click", () => {
            cartModal.style.display = "flex";
            updateCartUI();
        });
    }

    if (closeCartBtn && cartModal) {
        closeCartBtn.addEventListener("click", () => {
            cartModal.style.display = "none";
        });
    }

    if (whatsappOrderBtn) {
        whatsappOrderBtn.addEventListener("click", function() {
            if (cartList.length === 0) {
                alert("Заказ берүү үчүн алгач корзинага товар кошуңуз!");
                return;
            }

            let textMessage = "Саламатсызбы, Trendshop! Мен ушул товарларга заказ берейин дегем:\n\n";
            let total = 0;

            cartList.forEach((item, idx) => {
                textMessage += `${idx + 1}. *${item.title}* - ${item.price} сом\n`;
                total += parseInt(item.price);
            });

            textMessage += `\n*Жалпы сумма:* ${total} сом`;
            
            const encodedMessage = encodeURIComponent(textMessage);
            window.location.href = `https://wa.me/${myWhatsAppNumber}?text=${encodedMessage}`;
        });
    }

    loadProductsFromFirebase();
});