// Copyright (c) 2019, Hardik Gadesha and contributors
// For license information, please see license.txt

frappe.ui.form.on('Smart POS', {
	refresh: function(frm) {

	}
});

frappe.ui.form.on("Smart POS", {
onload: function(me) {
    		me.page.sidebar.remove();
    		me.page.wrapper.find(".layout-main-section-wrapper").removeClass("col-md-10");
    		cur_frm.clear_table("pos_item_table");
            frm.set_value("net_total","");
            frm.set_value("grand_total","");
}
});

frappe.ui.form.on("Smart POS", {
validate: function(frm,cdt,cdn) {
    frappe.confirm(
    'Are you sure to submit?',
    function(){
        frappe.call({
            method:"smart_pos.smart_pos.doctype.smart_pos.smart_pos.make_invoice",
            args:{'doctype':frm.doc.doctype,'name':frm.doc.name},
            callback:function(r){
                console.log(r);
                if(r.message){
                frm.clear_table("pos_item_table");
                frm.set_value("net_total",0.0);
                frm.set_value("grand_total",0.0);
                frm.refresh_field("pos_item_table");
                frappe.msgprint(`<a class="btn btn-primary" href=`+r.message+` target="_blank" style="margin-right: 5px;">
					${__('Print')}</a>`);
            }
            } 
        });
    },
    function(){
    });
}
});

cur_frm.add_fetch('item', 'standard_rate', 'standard_rate');
cur_frm.add_fetch('item', 'standard_rate', 'rate');
cur_frm.add_fetch('item', 'stock_uom', 'stock_uom');

frappe.ui.form.on("POS Item Table", "qty", function(frm, cdt, cdn){

	cur_frm.refresh();
	cur_frm.refresh_fields();
	var d = locals[cdt][cdn];
	frappe.model.set_value(d.doctype, d.name, "amount", (d.qty * d.rate));
		var pos_item_table = frm.doc.pos_item_table;
	  	var net_total = 0;
			for (var i in pos_item_table){
				net_total = net_total + pos_item_table[i].amount;
				cur_frm.set_value("net_total",net_total.toFixed(2));
				cur_frm.set_value("grand_total",net_total.toFixed(2));
			}
});

frappe.ui.form.on("POS Item Table", "discount", function(frm, cdt, cdn){

	cur_frm.refresh();
	cur_frm.refresh_fields();
	var d = locals[cdt][cdn];
	frappe.model.set_value(d.doctype, d.name, "rate", (d.standard_rate -(d.discount / 100) * d.standard_rate));
	frappe.model.set_value(d.doctype, d.name, "amount", (d.rate * d.qty));
		var pos_item_table = frm.doc.pos_item_table;
	  	var net_total = 0;
			for (var i in pos_item_table){
				net_total = net_total + pos_item_table[i].amount;
				cur_frm.set_value("net_total",net_total.toFixed(2));
				cur_frm.set_value("grand_total",net_total.toFixed(2));
			}
});

frappe.ui.form.on("POS Item Table", "rate", function(frm, cdt, cdn){

	cur_frm.refresh();
	cur_frm.refresh_fields();
	var d = locals[cdt][cdn];
	frappe.model.set_value(d.doctype, d.name, "amount", (d.rate * d.qty));
		var pos_item_table = frm.doc.pos_item_table;
  		var net_total = 0;
			for (var i in pos_item_table){
				net_total = net_total + pos_item_table[i].amount;
				cur_frm.set_value("net_total",net_total.toFixed(2));
				cur_frm.set_value("grand_total",net_total.toFixed(2));
			}
});

frappe.ui.form.on("POS Item Table", "pos_item_table_remove", function(frm, cdt, cdn){

	cur_frm.refresh();
	cur_frm.refresh_fields();
	var d = locals[cdt][cdn];
	var pos_item_table = frm.doc.pos_item_table;
  	var net_total = 0;
		for (var i in pos_item_table){
			net_total = net_total + pos_item_table[i].amount;
			cur_frm.set_value("net_total",net_total.toFixed(2));
			cur_frm.set_value("grand_total",net_total.toFixed(2));
		}
});

frappe.ui.form.on('Smart POS', {
    get_settings: function(frm) {
        	if(frm.doc.get_settings == 1 &&frappe.session.user != 'Administrator'){
    frappe.model.with_doc("Smart POS Settings", frappe.session.user, function() {
		cur_frm.refresh();
		cur_frm.refresh_fields();
		cur_frm.clear_table("smart_pos_payment_mode");
            		var tabletransfer= frappe.model.get_doc("Smart POS Settings", frappe.session.user);
            		$.each(tabletransfer.smart_pos_payment_mode, function(index, row){
                		var d = frm.add_child("smart_pos_payment_mode");
                		d.default = row.default;
				        d.mode = row.mode;
				        d.amount = row.amount;
			        	d.account = row.account;
                	frm.refresh_field("smart_pos_payment_mode");
            });
        });
}

    cur_frm.refresh();
	cur_frm.refresh_fields();

	if(frappe.session.user){

    frappe.call({
    "method": "smart_pos.smart_pos.doctype.smart_pos.smart_pos.getSettings",
        args: {
            user: frappe.session.user
    },
callback:function(r){
	var len=r.message.length;
	for (var i=0;i<len;i++){
		frm.set_value("customer",r.message[i][0]);
		frm.set_value("warehouse",r.message[i][1]);
		frm.set_value("cost_center",r.message[i][2]);
		frm.set_value("is_paid",r.message[i][3]);
		frm.set_value("update_stock",r.message[i][4]);
	}
	}
    });
}
       
      } 
});

frappe.ui.form.on("POS Item Table",{
        "item" : function (frm, cdt, cdn){
	var d2 = locals[cdt][cdn];
	if(d2.item){
	frappe.call({
		"method": "smart_pos.smart_pos.doctype.smart_pos.smart_pos.getVAL_Rate",
		args: {
			item: d2.item
		},
		callback:function(r){
		frappe.model.set_value(d2.doctype, d2.name, "valuation_rate", r.message);
}
});
}
}
});

/*frappe.ui.form.on('Smart POS',  {
    after_save: function(frm) {
        cur_frm.clear_table("pos_item_table");
        frm.set_value("net_total",0.0);
        frm.set_value("grand_total",0.0);
    } 
});*/
