package com.cts.cbs.entity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullName;
    private String email;
    private String password;
    private String phone;
    private String role; // USER or DRIVER

    // Driver-specific fields
    private String aadharNumber;
    private String licenseNumber;
    private String vehicleModel;
    private String vehicleNumber;
    
    private String blockStatus = "no"; // 'no' means not blocked, 'yes' means blocked
    private String comments = "no comments";
    
    @Column(name = "admin_approval", nullable = true)
    private String adminApproval; // 'pending', 'approved', 'rejected' - set based on role
    
    @Column(name = "admin_comment", nullable = true)
    private String adminComment; // Reason/comment for rejection
    
    @Column(name = "registration_date")
    private String registrationDate; // Store as ISO string or date
    
    //default constructor
	public UserEntity() {
		super();
	}
	
	//constructor using fields 
	public UserEntity(Long id, String fullName, String email, String password, String phone, String role,
			String aadharNumber, String licenseNumber, String vehicleModel, String vehicleNumber, String blockStatus,
			String comments, String adminApproval) {
		super();
		this.id = id;
		this.fullName = fullName;
		this.email = email;
		this.password = password;
		this.phone = phone;
		this.role = role;
		this.aadharNumber = aadharNumber;
		this.licenseNumber = licenseNumber;
		this.vehicleModel = vehicleModel;
		this.vehicleNumber = vehicleNumber;
		this.blockStatus = blockStatus;
		this.comments = comments;
		this.adminApproval = adminApproval;
	}

	 // Getters and Setters
	
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

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getPhone() {
		return phone;
	}

	public void setPhone(String phone) {
		this.phone = phone;
	}

	public String getRole() {
		return role;
	}

	public void setRole(String role) {
		this.role = role;
	}

	public String getAadharNumber() {
		return aadharNumber;
	}

	public void setAadharNumber(String aadharNumber) {
		this.aadharNumber = aadharNumber;
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

	public String getBlockStatus() {
        return blockStatus;
    }
    public void setBlockStatus(String blockStatus) {
        this.blockStatus = blockStatus;
    }
    public String getComments() {
        return comments;
    }
    public void setComments(String comments) {
        this.comments = comments;
    }
    public String getAdminApproval() {
        return adminApproval;
    }
    public void setAdminApproval(String adminApproval) {
        this.adminApproval = adminApproval;
    }

    public String getAdminComment() {
        return adminComment;
    }
    public void setAdminComment(String adminComment) {
        this.adminComment = adminComment;
    }
    
    public String getRegistrationDate() {
        return registrationDate;
    }
    public void setRegistrationDate(String registrationDate) {
        this.registrationDate = registrationDate;
    }

    // Fix vehicleBrand/model getters
    public String getVehicleBrand() {
        // If vehicleModel contains brand and model, split and return brand
        if (vehicleModel != null && vehicleModel.contains(",")) {
            return vehicleModel.split(",")[0].trim();
        }
        return vehicleModel;
    }
    // Only one getVehicleModel() method should exist
    public String getVehicleModelOnly() {
        // Return only the model part if vehicleModel contains brand,model
        if (vehicleModel != null && vehicleModel.contains(",")) {
            String[] parts = vehicleModel.split(",");
            return parts.length > 1 ? parts[1].trim() : vehicleModel;
        }
        return vehicleModel;
    }

    // Add getRegistered() to return registrationDate for compatibility
    public String getRegistered() {
        return registrationDate;
    }
    
    // to string 
	@Override
	public String toString() {
		return "UserEntity [id=" + id + ", fullName=" + fullName + ", email=" + email + ", password=" + password
				+ ", phone=" + phone + ", role=" + role + ", aadharNumber=" + aadharNumber + ", licenseNumber="
				+ licenseNumber + ", vehicleModel=" + vehicleModel + ", vehicleNumber=" + vehicleNumber
				+ ", blockStatus=" + blockStatus + ", comments=" + comments + ", adminApproval=" + adminApproval
				+ ", adminComment=" + adminComment + "]";
	}
}