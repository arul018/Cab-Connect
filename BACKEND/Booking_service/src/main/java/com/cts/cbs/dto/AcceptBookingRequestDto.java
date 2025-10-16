package com.cts.cbs.dto;

public class AcceptBookingRequestDto {
    private Long driverId;
    private String status;
	public AcceptBookingRequestDto() {
		super();
	}
	public AcceptBookingRequestDto(Long driverId, String status) {
		super();
		this.driverId = driverId;
		this.status = status;
	}
	public Long getDriverId() {
		return driverId;
	}
	public void setDriverId(Long driverId) {
		this.driverId = driverId;
	}
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	@Override
	public String toString() {
		return "AcceptBookingRequestDto [driverId=" + driverId + ", status=" + status + "]";
	}
    
}