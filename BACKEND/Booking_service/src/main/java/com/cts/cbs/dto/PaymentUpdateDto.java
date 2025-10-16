
package com.cts.cbs.dto;

//Simple DTO for updating payment status only
public class PaymentUpdateDto {
 private String paymentStatus;
 
 public PaymentUpdateDto() {
     super();
 }
 
 public PaymentUpdateDto(String paymentStatus) {
     this.paymentStatus = paymentStatus;
 }
 
 public String getPaymentStatus() {
     return paymentStatus;
 }
 
 public void setPaymentStatus(String paymentStatus) {
     this.paymentStatus = paymentStatus;
 }
 
 @Override
 public String toString() {
     return "PaymentUpdateDto [paymentStatus=" + paymentStatus + "]";
 }
}