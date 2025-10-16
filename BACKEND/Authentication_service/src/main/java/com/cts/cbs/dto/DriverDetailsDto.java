package com.cts.cbs.dto;

public class DriverDetailsDto {
	 private Long id;
	    private String fullName;
	    private String email;
	    private String phone;
	    private String licenseNumber;
	    private String vehicleModel;
	    private String vehicleNumber;
	    private String aadharNumber;
		public DriverDetailsDto() {
			super();
		}
		public Long getId() {
			return id;
		}
		public void setId(Long id) {
			this.id = id;
		}
		public String getFullName() {
			return fullName;
		}
		public void setFullName(String fullName) {
			this.fullName = fullName;
		}
		public String getEmail() {
			return email;
		}
		public void setEmail(String email) {
			this.email = email;
		}
		public String getPhone() {
			return phone;
		}
		public void setPhone(String phone) {
			this.phone = phone;
		}
		public String getLicenseNumber() {
			return licenseNumber;
		}
		public void setLicenseNumber(String licenseNumber) {
			this.licenseNumber = licenseNumber;
		}
		public String getVehicleModel() {
			return vehicleModel;
		}
		public void setVehicleModel(String vehicleModel) {
			this.vehicleModel = vehicleModel;
		}
		public String getVehicleNumber() {
			return vehicleNumber;
		}
		public void setVehicleNumber(String vehicleNumber) {
			this.vehicleNumber = vehicleNumber;
		}
		public String getAadharNumber() {
			return aadharNumber;
		}
		public void setAadharNumber(String aadharNumber) {
			this.aadharNumber = aadharNumber;
		}
		public DriverDetailsDto(Long id, String fullName, String email, String phone, String licenseNumber,
				String vehicleModel, String vehicleNumber, String aadharNumber) {
			super();
			this.id = id;
			this.fullName = fullName;
			this.email = email;
			this.phone = phone;
			this.licenseNumber = licenseNumber;
			this.vehicleModel = vehicleModel;
			this.vehicleNumber = vehicleNumber;
			this.aadharNumber = aadharNumber;
		}
		@Override
		public String toString() {
			return "DriverDetailsDto [id=" + id + ", fullName=" + fullName + ", email=" + email + ", phone=" + phone
					+ ", licenseNumber=" + licenseNumber + ", vehicleModel=" + vehicleModel + ", vehicleNumber="
					+ vehicleNumber + ", aadharNumber=" + aadharNumber + "]";
		}
}
