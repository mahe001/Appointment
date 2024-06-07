/*global QUnit*/

sap.ui.define([
	"comdoc/project1/controller/Appointment.controller"
], function (Controller) {
	"use strict";

	QUnit.module("Appointment Controller");

	QUnit.test("I should test the Appointment controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
