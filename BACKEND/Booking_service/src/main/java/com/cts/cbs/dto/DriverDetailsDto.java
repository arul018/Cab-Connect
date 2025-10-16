package com.cts.cbs.dto;

public class DriverDetailsDto {
	private Long id;
    private String fullName;
    private String phone;
    private String email;
    private String licenseNumber;
    private String vehicleNumber;
    private String vehicleModel;
    private String aadharNumber;
	public DriverDetailsDto() {
		super();
	}
	public DriverDetailsDto(Long id, String fullName, String phone, String email, String licenseNumber,
			String vehicleNumber, String vehicleModel, String aadharNumber) {
		super();
		this.id = id;
		this.fullName = fullName;
		this.phone = phone;
		this.email = email;
		this.licenseNumber = licenseNumber;
		this.vehicleNumber = vehicleNumber;
		this.vehicleModel = vehicleModel;
		this.aadharNumber = aadharNumber;
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
	public String getPhone() {
		return phone;
	}
	public void setPhone(String phone) {
		this.phone = phone;
	}
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	public String getLicenseNumber() {
		return licenseNumber;
	}
	public void setLicenseNumber(String licenseNumber) {
		this.licenseNumber = licenseNumber;
	}
	public String getVehicleNumber() {
		return vehicleNumber;
	}
	public void setVehicleNumber(String vehicleNumber) {
		this.vehicleNumber = vehicleNumber;
	}
	public String getVehicleModel() {
		return vehicleModel;
	}
	public void setVehicleModel(String vehicleModel) {
		this.vehicleModel = vehicleModel;
	}
	public String getAadharNumber() {
		return aadharNumber;
	}
	public void setAadharNumber(String aadharNumber) {
		this.aadharNumber = aadharNumber;
	}
	@Override
	public String toString() {
		return "DriverDetailsDto [id=" + id + ", fullName=" + fullName + ", phone=" + phone + ", email=" + email
				+ ", licenseNumber=" + licenseNumber + ", vehicleNumber=" + vehicleNumber + ", vehicleModel=" + vehicleModel
				+ ", aadharNumber=" + aadharNumber + "]";
	}
	
}
