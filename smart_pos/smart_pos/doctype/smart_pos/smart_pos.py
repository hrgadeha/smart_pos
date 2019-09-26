# -*- coding: utf-8 -*-
# Copyright (c) 2019, Hardik Gadesha and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class SmartPOS(Document):
	def validate(self):
		items = []
		payments = []
		for d in self.pos_item_table:
				items.append({"item_code": d.item,"qty": d.qty,"rate": d.rate,"amount": d.amount,"stock_uom": d.uom,"warehouse":self.warehouse})
		for i in self.smart_pos_payment_mode:
				payments.append({"default": i.default,"mode_of_payment": i.mode,"account": i.account,"amount": i.amount})
		sales_invoice= frappe.get_doc({
		"doctype": "Sales Invoice", 
		"customer": self.customer,
		#"is_pos": 1,
		#"update_stock": 1,
		"set_warehouse": self.warehouse,
		"posting_date": self.posting_date,
		"posting_time": self.time,
		"items": items,
		"payments": payments
		})
		sales_invoice.save()

@frappe.whitelist(allow_guest=True)
def getSettings(user):
	item_data = frappe.db.sql("""select customer,warehouse,cost_center,is_paid,update_stock
from `tabSmart POS Settings` where  user_id =  '{0}'; """.format(user), as_list=1)
	return item_data

@frappe.whitelist(allow_guest=True)
def getVAL_Rate(item):
	item_data = frappe.db.sql("""select valuation_rate from `tabStock Ledger Entry` where item_code = '{0}' and is_cancelled='No' order by posting_date desc, posting_time desc, name desc limit 1; """.format(item), as_list=1)
	return item_data
