package com.cts.cbs.dto;

public class DriverDetailsDto {
    private Long id;
    private String fullName;
    private String phone;
    private String email;
    private String licenseNumber;
    private String carNumber;
    private String carModel;
    private String aadharNumber;

    public DriverDetailsDto() {
        super();
    }

    public DriverDetailsDto(Long id, String fullName, String phone, String email, String licenseNumber,
            String carNumber, String carModel, String aadharNumber) {
        super();
        this.id = id;
        this.fullName = fullName;
        this.phone = phone;
        this.email = email;
        this.licenseNumber = licenseNumber;
        this.carNumber = carNumber;
        this.carModel = carModel;
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

    public String getCarNumber() {
        return carNumber;
    }

    public void setCarNumber(String carNumber) {
        this.carNumber = carNumber;
    }

    public String getCarModel() {
        return carModel;
    }

    public void setCarModel(String carModel) {
        this.carModel = carModel;
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
                + ", licenseNumber=" + licenseNumber + ", carNumber=" + carNumber + ", carModel=" + carModel
                + ", aadharNumber=" + aadharNumber + "]";
    }
}
