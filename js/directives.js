/// <reference path="../typings/angularjs/angular.d.ts"/>
/// <reference path="./services.ts"/>
var jsonFormsDirectives = angular.module('jsonForms.directives', ['jsonForms.services']);
var JsonFormsDiretiveController = (function () {
    function JsonFormsDiretiveController(RenderService, ReferenceResolver, $scope) {
        this.RenderService = RenderService;
        this.ReferenceResolver = ReferenceResolver;
        this.$scope = $scope;
        // TODO: call syntax
        var schema = $scope.schema;
        var dataProvider = $scope.providerName;
        schema["uiSchema"] = $scope.uiSchema;
        ReferenceResolver.addToMapping(JsonRefs.findRefs($scope.uiSchema));
        var that = this;
        // TODO
        if (dataProvider !== undefined) {
            dataProvider.fetchData().$promise.then(function (data) {
                JsonRefs.resolveRefs(schema, {}, function (err, resolvedSchema, meta) {
                    var ui = resolvedSchema["uiSchema"];
                    $scope['elements'] = [that.RenderService.render(ui, schema, data, "#", dataProvider)];
                });
            });
        }
        else {
            var data = $scope.data;
            JsonRefs.resolveRefs(schema, {}, function (err, resolvedSchema, meta) {
                var ui = resolvedSchema['uiSchema'];
                $scope['elements'] = [that.RenderService.render(ui, schema, data, "#", null)];
            });
        }
        // TODO
        $scope['opened'] = false;
        $scope['openDate'] = function ($event, element) {
            $event.preventDefault();
            $event.stopPropagation();
            element.isOpen = true;
        };
        $scope['validateNumber'] = function (value, element) {
            if (value !== undefined && value !== null && isNaN(value)) {
                element.alerts = [];
                var alert = {
                    type: 'danger',
                    msg: 'Must be a valid number!'
                };
                element.alerts.push(alert);
                return false;
            }
            element.alerts = [];
            return true;
        };
        $scope['validateInteger'] = function (value, element) {
            if (value !== undefined && value !== null && (isNaN(value) || (value !== "" && !(/^\d+$/.test(value))))) {
                element.alerts = [];
                var alert = {
                    type: 'danger',
                    msg: 'Must be a valid integer!'
                };
                element.alerts.push(alert);
                return false;
            }
            element.alerts = [];
            return true;
        };
    }
    JsonFormsDiretiveController.$inject = ['RenderService', 'ReferenceResolver', '$scope'];
    return JsonFormsDiretiveController;
})();
var RecElement = (function () {
    function RecElement(recursionHelper) {
        var _this = this;
        this.recursionHelper = recursionHelper;
        this.restrict = "E";
        this.replace = true;
        this.scope = {
            element: '=',
            bindings: '=',
            topOpenDate: '=',
            topValidateNumber: '=',
            topValidateInteger: '='
        };
        this.templateUrl = 'templates/element.html';
        this.compile = function (element, attr, trans) {
            return _this.recursionHelper.compile(element, trans);
        };
    }
    return RecElement;
})();
jsonFormsDirectives.directive('control', function () {
    return {
        restrict: "E",
        replace: true,
        scope: {
            control: '=',
            bindings: '=',
            topOpenDate: '=',
            topValidateNumber: '=',
            topValidateInteger: '='
        },
        templateUrl: 'templates/control.html'
    };
}).directive('jsonforms', function () {
    return {
        restrict: "E",
        replace: true,
        scope: {
            schema: '=',
            uiSchema: '=',
            data: '=',
            providerName: '='
        },
        // TODO: fix template for tests
        templateUrl: 'templates/form.html',
        controller: JsonFormsDiretiveController
    };
}).directive('recelement', ['RecursionHelper', function (recHelper) {
    return new RecElement(recHelper);
}]);
//# sourceMappingURL=directives.js.map