'use strict';
(function() {

  angular
    .module('myApp.view1', ['ngRoute'])
    .config(['$routeProvider', function($routeProvider) {
      $routeProvider.when('/view1', {
        templateUrl: 'view1/view1.html',
      });
    }])
    .service('ShoppingCartService', function($rootScope){
      this.goods = [
        {
          name: 'Товар1',
          price: 125,
          rest: 20,
        },
        {
          name: 'Товар2',
          price: 250,
          rest: 10,
        },
        {
          name: 'Товар3',
          price: 250,
          rest: 0,
        },
        {
          name: 'Товар4',
          price: 2.5,
          rest: 10,
        },
        {
          name: 'Товар5',
          price: 17.5,
          rest: 10,
        },
        {
          name: 'Товар6',
          price: 6,
          rest: 10,
        },
        {
          name: 'Товар7',
          price: 7,
          rest: 10,
        },
        {
          name: 'Товар8',
          price: 8,
          rest: 10,
        }
      ];
      this.cartItems = [];
      this.totalCost = 0;
      let that = this;

      /*this.listen = function($scope) {
        $scope.$watch(function(){return $scope.goods},function(){
          alert('polychilos')
        });
      };*/

      this.addToCart_ = function (item) {
        let searchInCartByName = that.findItemInStorage(item, 'cartItems').el;
        let searchInGoodsByName = that.findItemInStorage(item, 'goods').el;
        if (!searchInCartByName) {
          that.cartItems.push(item);
          searchInGoodsByName.rest = searchInGoodsByName.rest - item.toAddAmount;
          searchInGoodsByName.toAddAmount = 1;
        } else {
          searchInGoodsByName.rest = searchInGoodsByName.rest - item.toAddAmount;
          searchInCartByName.toAddAmount = searchInCartByName.toAddAmount + item.toAddAmount;
        }
      };

      this.removeItems_ = function (item) {
        let inCart = that.findItemInStorage(item, 'cartItems');
        let inGoods = that.findItemInStorage(item, 'goods').el;

        inGoods.rest = inGoods.rest + inCart.el.toAddAmount;
        that.cartItems.splice(inCart.index, 1);
      };
      /*
      * проверка начилия в корзине данной позиции товара
      * */
      this.findItemInStorage = function (item, storage) {
        let result = false;
        that[storage].forEach(function (el, i) {
          //здесь по id конечно надо искать
          if (el.name == item.name) result = {el:el, index: i};
        });

        return result;
      };
    })
    .controller('GoodsCtrl', function ($scope, $rootScope, ShoppingCartService) {
      $scope.goods = ShoppingCartService.goods;

      $scope.goods.forEach(function(e) {
        e.toAddAmount = 1;
      });

      /*
       * проверка наличия на складе
       * */
      $scope.checkRest = function (product) {
        return (product.rest > 0) ? true : false;
      };

      /*
      * Изменение количества товара для добавления в корзину из списка "Товары"
      * */
      $scope.increaseToAddMount = function(product) {
        if (product.rest > product.toAddAmount) product.toAddAmount++;
      };

      $scope.decreaseToAddMount = function(product) {
        product.toAddAmount = Math.max(1, --product.toAddAmount);
      };
    })
    .controller('CartCtrl', function ($scope, $rootScope, ShoppingCartService) {
      $scope.goods = ShoppingCartService.cartItems;
      $scope.totalCost = ShoppingCartService.totalCost;
      /*$scope.$watch(ShoppingCartService.cartItems, function() {
        console.log($scope.goods)
      });*/

      /*$scope.listen = function() {
        ShoppingCartService.listen($scope);
      };

      $scope.listen();*/

      /*
       * проверка наличия на складе
       * */
      $scope.cartEmpty = function () {
        if ($scope.goods.length > 0) return false;
        return true;
      };

      this.addToCart = function (item) {
        ShoppingCartService.addToCart_(item);
      };

      $scope.removeItems = function (item) {
        ShoppingCartService.removeItems_(item);
      };


    })
    .directive('goodsWidget', function() {
      return {
        restrict: 'AE',
        /*replace: true,*/
        scope: {},
        controller: 'GoodsCtrl',
        templateUrl: 'view1/goods.html',
        /*link: function(scope, element, attributes) {
          scope.items = [];
          // слушаем изменения в корзине
          scope.$watch(shoppingCartService.getItems, function(items) {
            scope.items = items;
          });
        }*/
      }
    })
    .directive('shoppingCart', function(ShoppingCartService) {
      return {
        restrict: 'AE',
        /*replace: true,*/
        scope: {},
        controller: 'CartCtrl',
        templateUrl: 'view1/cart.html',
        /*link: function(scope, element, attributes) {
          scope.items = [];
        }*/
      }
    })
    .directive('draggable', function() {
      return function(scope, element) {
        // this gives us the native JS object
        let el = element[0];

        el.draggable = true;

        el.addEventListener('dragstart', function(e) {
          e.dataTransfer.effectAllowed = 'move';
          let product = this.getAttribute('product');
          e.dataTransfer.setData('Item', product);
          this.classList.add('drag');
          return false;
        }, false);

        el.addEventListener('dragend', function(e) {
          this.classList.remove('drag');
          return false;
        }, false);
      }
    })
    .directive('droppable', function(ShoppingCartService) {
      return {
        scope: {
          drop: '&',
        },
        controller: 'CartCtrl',
        link: function(scope, element, attrs, CartCtrl) {
          let el = element[0];

          el.addEventListener('dragover', function(e) {
            e.dataTransfer.dropEffect = 'move';
            if (e.preventDefault) e.preventDefault();
            this.classList.add('over');
            return false;
          }, false);

          el.addEventListener('dragenter', function(e) {
            this.classList.add('over');
            return false;
          }, false);

          el.addEventListener('dragleave', function(e) {
            this.classList.remove('over');
            return false;
          }, false);

          el.addEventListener('drop', function(e) {
            if (e.stopPropagation) e.stopPropagation();

            this.classList.remove('over');

            let item = JSON.parse(e.dataTransfer.getData('Item'));
            CartCtrl.addToCart(item);
            scope.$apply(function($scope) {

            });

            return false;
          }, false);
        }
      }
    });
})();