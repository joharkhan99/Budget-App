//materialize methods
$(document).ready(function(){
  $('.sidenav').sidenav();
  $('select').formSelect();
  $('.tooltipped').tooltip();
  $('.carousel').carousel({
    indicators: true
  });
});

$(document).on('contextmenu', e=>{e.preventDefault()});


//BUDGET CONTROLLER
var budgetController = (function () {
  var Expense = function (id, description, value) {    //constructor
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function () {
    return this.percentage;
  };

  var Income = function (id, description, value) {    //constructor
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function (type) {
    var sum = 0;
    data.allItems[type].forEach(function (curr) {
      sum += curr.value;
    });

    data.totals[type] = sum;     //add sum to totals in data obj
  };

  var data = {                //make an obj for expanese and incomes
    allItems: {          //all the income and expenses here
      exp: [],
      inc: []
    },
    totals: {           //for incrementing the expen/incom in this obj
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1     //if there is no budget values then it will give -1 else gives percent
  };

  return {
    addItem: function (type, des, val) {
      var newItem, ID;

      //[1 2 3 4 5] next=6
      //[1 2 4 6 8] next=9
      //so ID = last ID + 1

      //Create a new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      //create new items on based of 'inc' or 'exp'
      if (type == "exp") {
        newItem = new Expense(ID, des, val);
      } else if (type == "inc") {
        newItem = new Income(ID, des, val);
      }

      //push it into data object
      data.allItems[type].push(newItem);     //add new item in either of two arrays

      //return the new element
      return newItem;
    },
    deleteItem: function (type, id) {
      var ids, index;
      // id=6
      // data.allItems[type][id];
      // ids = [1 2 4 6 8]
      // index = 3              so 3 will be deleted here which is 6

      ids = data.allItems[type].map(function (current) {
        return current.id;
      });

      index = ids.indexOf(id);
      if (index !== -1) {
        data.allItems[type].splice(index, 1);  //for removing the index elem from html
      }
    },

    calculateBudget: function () {
      //calculate total icome and expenses
      calculateTotal('exp');
      calculateTotal('inc');

      //calculate the budget: income-expenses
      data.budget = data.totals.inc - data.totals.exp;

      //calculate the percentage of income that we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    calculatePercentages: function () {

      /*
      a=20
      b=10
      c=40
      income=100               //this is kind of formula for percent cal
      a=20/100=20%
      b=10/100=10%
      c=40/100=40%
      */

      data.allItems.exp.forEach(function (curr) {
        curr.calcPercentage(data.totals.inc);
      });
    },

    getBudget: function () {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      }
    },

    getPercentages: function () {
      var allPerc = data.allItems.exp.map(function (cur) {
        return cur.getPercentage();
      });
      return allPerc;
    },

    test: function () {
      console.log(data);
    }
  };


})();


//UI CONTROLLER(USER INTERFACE)
var UIController = (function () {
  var DOMstrings = {            //these includes the class names
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expenseContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensesPercentLabel: ".item__percentage",
    dateLabel: '.budget__title--month'
  };
  var formatNumber = function (num, type) {
    var numSplit, int, dec;

    //+ or - before numbers
    //excatly 2 decimal places
    //comma seperating thousands

    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split(".");   //split the number on (.)

    int = numSplit[0];         //the int part
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);  //input = 2310 then result = 2,310
    }

    dec = numSplit[1];         //the decimal part

    return (type == 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
  };

  var nodeListForEach = function (list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);        //list item i and index i
    }
  };

  return {   //for returning an obj
    getInput: function () {      //method inside obj 
      return {
        type: $(DOMstrings.inputType).val(),  //will be either inc or exp
        description: $(DOMstrings.inputDescription).val(),
        value: parseFloat($(DOMstrings.inputValue).val())
      };
    },
    addListItem: function (obj, type) {
      var html, newHtml, element;
      //create html string with placeholder text
      //below is an income string from html

      if (type == "inc") {
        element = DOMstrings.incomeContainer;
        html = '<div class="item clearFix" id="inc-%id%"> <div class="item__description">%description%</div>' +
          ' <div class="right clearFix"> <div class="item__value">%value%</div>' +
          ' <div class="item__delete"> <button class="item__delete--btn">' +
          ' <ion-icon name="close-circle-outline"></ion-icon></button> </div> </div> </div>';
      } else if (type == "exp") {
        element = DOMstrings.expenseContainer;
        html = '<div class="item clearFix" id="exp-%id%"> <div class="item__description">%description%</div>' +
          ' <div class="right clearFix"> <div class="item__value">%value%</div>' +
          '<div class="item__percentage">21%</div> <div class="item__delete">' +
          '<button class="item__delete--btn"><ion-icon name="close-circle-outline"></ion-icon></button>' +
          '</div></div></div>';
      }

      //replace the placeholder text with actual data
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));

      //Insert the html into the DOM
      $(element).append(newHtml);         //add the newHtml as child strings of elem
    },

    deleteListItem: function (selectorID) {
      var element = document.getElementById(selectorID);
      element.parentNode.removeChild(element);
    },

    clearFields: function () {
      var fields, fieldsArray;
      fields = document.querySelectorAll(DOMstrings.inputDescription + "," + DOMstrings.inputValue);

      fieldsArray = Array.prototype.slice.call(fields);
      fieldsArray.forEach(function (current, index, array) {
        current.value = "";
      });
      fieldsArray[0].focus();
    },
    displayBudget: function (obj) {
      var type;
      obj.budget > 0 ? type = "inc" : type = "exp";

      $(DOMstrings.budgetLabel).text(formatNumber(obj.budget, type));
      $(DOMstrings.incomeLabel).text(formatNumber(obj.totalInc, 'inc'));
      $(DOMstrings.expensesLabel).text(formatNumber(obj.totalExp, 'exp'));

      if (obj.percentage > 0) {
        $(DOMstrings.percentageLabel).text(obj.percentage + "%");
      } else {
        $(DOMstrings.percentageLabel).text("---");
      }
    },

    displayPercentages: function (percentages) {

      var fields = document.querySelectorAll(DOMstrings.expensesPercentLabel);    //now its an NodeList which have many elements

      nodeListForEach(fields, function (current, index) {
        if (percentages[index] > 0) {
          current.texContent = percentages[index] + "%";
        } else {
          current.texContent = "---";
        }
      });
    },

    displayMonth: function () {
      var now, year, month;
      now = new Date();

      var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

      month = now.getMonth();

      year = now.getFullYear();
      $(DOMstrings.dateLabel).text(months[month] + ", " + year);
    },

    changeColors: function () {

      var fields = $(".add__type, .add__description, .add__value");
      nodeListForEach(fields, function (cur) {
        $(cur).toggleClass("red-focus");
      });
      $(".add__btn").toggleClass("red");
    },

    getDOMstrings: function () {    //so that we can access the strings from outside
      return DOMstrings;
    }
  };

})();



//GLOBAL APP.....here everything is controlled and executed
var controller = (function (budgetCtrl, UICtrl) {

  var setAllEvents = function () {      //store all events here

    var DOM = UICtrl.getDOMstrings();     //call the DOMstring() function here

    $(DOM.inputBtn).on("click", ctrlAddItem);

    $("body").keypress(function (event) {
      if (event.keyCode == 13) {
        ctrlAddItem();
      }
    });
    $(DOM.container).on("click", ctrlDeleteItem);

    $(DOM.inputType).on("change", UICtrl.changeColors);
  };

  var updateBudget = function () {

    //1. Calculate the budget
    budgetCtrl.calculateBudget();

    //2. Return budget
    var budget = budgetCtrl.getBudget();

    //3. Display the budget on the UI
    UICtrl.displayBudget(budget);
  };

  var updatPercentages = function () {

    //1. calculate percentages
    budgetCtrl.calculatePercentages();

    //2. read percentages from budget controller
    var percentages = budgetCtrl.getPercentages();

    //3. update UI with new percentage
    UICtrl.displayPercentages(percentages);

  };

  var ctrlAddItem = function () {
    var input, newItem;
    //1. get the field input data
    input = UICtrl.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      //2. Add the item to budget controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);//access these values from above input  var

      //3. Add item to the UI
      UICtrl.addListItem(newItem, input.type);

      //4. clear the fields
      UICtrl.clearFields();

      //5. Calculate and update budget
      updateBudget();

      //6. calculate and update percentages
      updatPercentages();
    }
  };

  var ctrlDeleteItem = function (event) {
    var itemID, splitID, type, ID;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      //inc-1
      splitID = itemID.split("-");  //split the id string on '-' place
      type = splitID[0];  //either exp or ind
      ID = parseInt(splitID[1]);   //any number

      //1. delete the item from data obj
      budgetCtrl.deleteItem(type, ID);

      //2. delete the item from he UI
      UICtrl.deleteListItem(itemID);

      //3. Update and show the new budget
      updateBudget();

      //4. calculate and update percentages
      updatPercentages();
    }
  };

  return {
    init: function () {    //initializatiion func 
      console.log("App has started");
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
      setAllEvents();
    }
  };
})(budgetController, UIController);  //IIFE func takes two args which we specified at starting


controller.init();     //call the init func to start everyting from here




