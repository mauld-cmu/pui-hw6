import React, { Component } from 'react';
import './Homepage.css';
import logo from './logo-01.svg';
import NavBar from '../../components/NavBar';
import Cart from '../../components/Cart';
import CartCard from '../../components/CartCard';
import SearchSortBar from '../../components/SearchSortBar'
import RollCard from '../../components/RollCard';
import { rollData, glazingData, packData } from '../../data/ShopData';

class RollObj {
  constructor(name, glaze, packSize) {
    // types can be "original", "apple", "raisin", "walnut", "chocolate", or "strawberry"
    this.name = name;
    this.displayName = rollData[this.name].displayName;

    // glazing can be "keepOriginal", "sugarMilk", "vanillaMilk", "doubleChocolate"
    this.glaze = glaze;
    this.glazeName = glazingData[this.glaze].displayName;

    // packSize can be "onePack", "threePack", "sixPack", or "twelvePack"
    this.packSize = packSize;
    this.packSizeName = packData[this.packSize].displayNumber;
    
    // calculates price 
    this.price = (rollData[this.name].basePrice + glazingData[this.glaze].price) * packData[this.packSize].priceMultiplier;
  }
}

class Homepage extends Component {
  constructor(props) {
    super(props);

    // For Roll
    this.addToCart = this.addToCart.bind(this);
    this.createRoll = this.createRoll.bind(this);
    // For Products
    this.populateProductGrid = this.populateProductGrid.bind(this);
    // For NavBar
    this.displayCartAmount = this.displayCartAmount.bind(this);
    this.displayCartTotal = this.displayCartTotal.bind(this);
    // For CartPopup
    this.closePopup = this.closePopup.bind(this);
    // For Cart
    this.toggleCart = this.toggleCart.bind(this);
    this.populateCartGrid = this.populateCartGrid.bind(this);
    this.removeFromCartByIndex = this.removeFromCartByIndex.bind(this);
    // For Search & Filter
    this.clickSearch = this.clickSearch.bind(this);
    this.sortProducts = this.sortProducts.bind(this);
    this.filterProducts = this.filterProducts.bind(this);
  }

  state = {
    // Stores the roll most recently added to cart - used for the cart popup
    currentRoll: new RollObj('original', 'keepOriginal', 'onePack'), 
    products: Object.values(rollData), // Contains listings for products
    cart: [], // Contains elements in the cart
    cartAmount: "0 items",
    cartTotal: "Total: $0.00",
    showCart: false,
    showCartPopup: false,
    sortCriteria: 'Base Price', // Criteria for Sorting (Base Price or Name)
    filterQuery: '' // Criteria for filtering (Nothing by default)
  };

  // Formats Floats into USD
  priceFormatter(unformattedPrice) {
    let formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    });
    return formatter.format(unformattedPrice);
  }

  // Creates a Roll Object given parameters, as to not have to define in children
  createRoll(name, glaze, packSize) {
    return new RollObj(name, glaze, packSize);
  }

  // Adds to cart list, triggers popup, and updates states for Nav Bar
  addToCart = (incomingRoll) => {
    this.setState({
      cart: this.state.cart.concat(incomingRoll)
    })
    this.setState({
      currentRoll: incomingRoll
    });
    this.setState({
      showCartPopup: true
    });
    this.setState({
      cartAmount: this.displayCartAmount()
    });
    this.setState({
      cartTotal: this.displayCartTotal()
    });
    
    setTimeout(this.closePopup, 3000);
  }

  // Populates the Grid of Products
  populateProductGrid() {
    return this.state.products.map(roll =>
      <RollCard
        key={roll.id}
        rollKey={roll.id}
        rollDatum={rollData[roll.id]}
        priceFormatter={this.priceFormatter}
        createRoll={this.createRoll}
        addToCart={this.addToCart}
      />
    )
  }

  // Closes popup after 3 seconds
  closePopup() {
    this.setState({
      showCartPopup: false
    })
  }

  // If showCart is true, set it to false - if false, set to true
  toggleCart() {
    if (this.state.showCart === true) {
      this.setState({
        showCart: false
      })
    } else {
      this.setState({
        showCart: true
      })
    }
  }

  // Creates a string displaying how many Rolls are in the cart array
  displayCartAmount() {
    if (this.state.cart.length === 0 || this.state.cart.length > 1) {
      return this.state.cart.length + " items";
    } else {
      return this.state.cart.length + " item";
    }
  }

   // Creates a string displaying how much Rolls are in the cart array cost
  displayCartTotal() {
    let totalPrice = this.state.cart.reduce((sum, roll) => {
      return sum + roll.price;
    }, 0);
    return "Total: " + this.priceFormatter(totalPrice);
  }

  // Populates the grid of CartCards
  populateCartGrid() {
    return this.state.cart.map((roll, index) =>
      <CartCard
        key={index}
        index={index}
        name={roll.name}
        displayName={roll.displayName}
        glazeName={roll.glazeName}
        packSizeName={roll.packSizeName}
        priceString={this.priceFormatter(roll.price)}
        removeFromCartByIndex={this.removeFromCartByIndex}
      />
    )
  }

  // Removes an element from the cart given an index - passed to Cart & CartCard
  removeFromCartByIndex(index) {
    if (this.state.cart.length >= 1) { // Ensure cart is not empty
      this.setState({
        cart: this.state.cart.filter((data, i) => i !== index)
      })
    }
  }

  // Handles action when search button is actually pressed
  clickSearch() {
    this.setState({
      products: Object.values(rollData).filter((str) => str.displayName.toLowerCase().includes(this.state.filterQuery))
    })
  }

  // Pulls data from filter and assigns choice to state - passed to SearchSortBar
  sortProducts = (event) => {
    this.setState({
      sortCriteria: event.target.value
    })
    if (event.target.value === 'Name') {
      this.state.products.sort((a, b) => (a.displayName > b.displayName ? 1 : -1));
    } else {
      this.state.products.sort((a, b) => (a.basePrice > b.basePrice ? 1 : -1));
    }
  }

  // Pulls data from search and assigns query to state - passed to SearchSortBar
  filterProducts = (event) => {
    this.setState({
      filterQuery: event.target.value.toLowerCase()
    })
  }

  render() { 
    return (
      <div className="homepage">
        <header>
          <img id="logo" src={logo} alt="Bun Bun Bake Shop logo with text" width="400" />
          <div id="header-text">
            <NavBar 
              currentRoll={this.state.currentRoll}
              priceFormatter={this.priceFormatter}
              showCartPopup={this.state.showCartPopup}
              toggleCart={this.toggleCart}
            />
            <hr/>
            <h1>Our hand-made cinnamon rolls</h1>
          </div>
        </header>
        <SearchSortBar
          clickSearch={this.clickSearch}
          sortProducts={this.sortProducts}
          filterProducts={this.filterProducts}
        />
        { this.state.showCart &&
          <Cart
            cart={this.state.cart}
            cartAmountDisplay={this.displayCartAmount()}
            cartTotalDisplay={this.displayCartTotal()}
            populateCartGrid={this.populateCartGrid}
            priceFormatter={this.priceFormatter}
          />
        }
        { this.state.products.length > 0 &&
          <div id="product-grid">
            {this.populateProductGrid()}
          </div>
        }
        { this.state.products.length === 0 &&
          <div id="no-match">
            <p>No Match!</p>
          </div>
        }
      </div>
    );
  }
}

export default Homepage;