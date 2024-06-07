sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text",
    "sap/m/Label",
    "sap/m/Input",
    "sap/m/TextArea",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment"
],
function (Controller,MessageBox, Dialog, Button, Text, Label, Input, TextArea,JSONModel,Fragment) {
    "use strict";

    return Controller.extend("com.doc.project1.controller.Appointment", {
        _appointmentBooked: false,
        onInit: function () {
// Load sample data
var oData = {
    appointments: [],
    doctorSchedule: {
        days: [
            { day: "Monday", slots:  [
                { "time": "09:00 - 09:30", "status": "Free" },
                { "time": "09:30 - 10:00", "status": "Free" },
                { "time": "10:00 - 10:30", "status": "Free" },
                { "time": "10:30 - 11:00", "status": "Free" },
                { "time": "11:00 - 11:30", "status": "Free" },
                { "time": "11:30 - 12:00", "status": "Booked" }
              ] },
            { day: "Tuesday", slots: [{ "time": "09:00 - 09:30", "status": "Free" },
            { "time": "09:30 - 10:00", "status": "Booked" },
            { "time": "10:00 - 10:30", "status": "Free" },
            { "time": "10:30 - 11:00", "status": "Free" },
            { "time": "11:00 - 11:30", "status": "Free" },
            { "time": "11:30 - 12:00", "status": "Free" }] },

            { day: "Wednesday", slots: [ { "time": "09:00 - 09:30", "status": "Booked" },
          { "time": "09:30 - 10:00", "status": "Free" },
          { "time": "10:00 - 10:30", "status": "Free" },
          { "time": "10:30 - 11:00", "status": "Free" },
          { "time": "11:00 - 11:30", "status": "Free" },
          { "time": "11:30 - 12:00", "status": "Free" }] },

            { day: "Thursday", slots: [{ "time": "09:00 - 09:30", "status": "Free" },
          { "time": "09:30 - 10:00", "status": "Free" },
          { "time": "10:00 - 10:30", "status": "Booked" },
          { "time": "10:30 - 11:00", "status": "Free" },
          { "time": "11:00 - 11:30", "status": "Free" },
          { "time": "11:30 - 12:00", "status": "Free" }] },

            { day: "Friday", slots: [ { "time": "09:00 - 09:30", "status": "Free" },
          { "time": "09:30 - 10:00", "status": "Free" },
          { "time": "10:00 - 10:30", "status": "Free" },
          { "time": "10:30 - 11:00", "status": "Free" },
          { "time": "11:00 - 11:30", "status": "Booked" },
          { "time": "11:30 - 12:00", "status": "Free" }] }
        ]
    }
};
var oModel = new JSONModel(oData);
this.getView().setModel(oModel);
        },
        onDayPress: function (oEvent) {
            
            var sDay = oEvent.getSource().data("day");
                 var oModel = this.getView().getModel();
                 var aDays = oModel.getProperty("/doctorSchedule/days");
                 var oDay = aDays.find(function (day) {
                     return day.day === sDay;
                 });
     
     
                 if (oDay) {
                     if (!this._pScheduleDialog) {
                         this._pScheduleDialog = Fragment.load({
                             id: this.getView().getId(),
                             name: "com.doc.project1.fragments.ScheduleDialog",
                             controller: this
                         }).then(function (oDialog) {
                             this.getView().addDependent(oDialog);
                             return oDialog;
                         }.bind(this));
                     }
                     this._pScheduleDialog.then(function (oDialog) {
                         var oList = this.byId("scheduleList");
                         oList.setModel(oModel);
                         oList.bindItems({
                             path: "/doctorSchedule/days/" + aDays.indexOf(oDay) + "/slots",
                             template: new sap.m.StandardListItem({
                                 title: "{time}",
                                 description: "{status}",
                                 type: "Active",
                                 press: [this.onSlotPress, this]
                             })
                         });
                         oDialog.setTitle("Schedule for " + sDay);
                         oDialog.open();
                     }.bind(this));
                 }
             },
        onSlotPress: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext();
            var oSlot = oContext.getObject();
            if (oSlot.status === "Free") {
                this._selectedSlotContext = oContext;
                MessageBox.success("Slot selected. Click 'Book Appointment' to proceed.");
                this._appointmentBooked = true;
            } else {
                MessageBox.error("This slot is already booked.");
            }
        },
        onCloseScheduleDialog: function () {
            this.byId("scheduleDialog").close();
        },
        onBookAppointment: function () {
            if (this._appointmentBooked === false) {
                MessageBox.warning("Please select a slot first.");
                return;
            }


            var oView = this.getView();
 

            if (!this._pDialog) {
                this._pDialog = Fragment.load({
                    id: this.getView().getId(),
                    name: "com.doc.project1.fragments.BookAppointmentDialog",
                    controller: this
                }).then(function (oDialog) {
                    this.getView().addDependent(oDialog);
                    return oDialog;
                }.bind(this));
            }
            this._pDialog.then(function (oDialog) {
                oDialog.open();
            });

        },
        
    
        onBook: function () {
            var sPatientName = sap.ui.getCore().byId(this.getView().getId() + "--patientNameInput").getValue();
            var sDescription = sap.ui.getCore().byId(this.getView().getId() + "--descriptionInput").getValue();

            if (sPatientName && sDescription) {
                var oModel = this.getView().getModel();
                var oSlot = this._selectedSlotContext.getObject();
                oSlot.status = "Booked";
                oSlot.patientDetails = {
                    patientName: sPatientName,
                    description: sDescription
                };

                oModel.refresh(true);
                this.byId("bookAppointmentDialog").close();
               
                this._appointmentBooked = false;
                this.clearForm();
                MessageBox.success("Appointment booked successfully.");
            } else {
                MessageBox.error("Please fill in all fields.");
            }
        },
        onCancel: function () {
            this.clearForm();
            this.byId("bookAppointmentDialog").close();
        },
        clearForm: function () {
            this.byId("patientNameInput").setValue("");
            this.byId("descriptionInput").setValue("");
        }


    });
});
