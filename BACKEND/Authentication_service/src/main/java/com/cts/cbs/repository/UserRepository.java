package com.cts.cbs.repository;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.cts.cbs.entity.UserEntity;
@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {
	
    // Case-insensitive email lookup
    @Query("SELECT u FROM UserEntity u WHERE LOWER(u.email) = LOWER(:email)")
    Optional<UserEntity> findByEmail(@Param("email") String email);
    
    List<UserEntity> findByRoleIgnoreCase(String role);
    
    // Find drivers with pending admin approval
    @Query("SELECT u FROM UserEntity u WHERE LOWER(u.role) = LOWER(:role) AND LOWER(u.adminApproval) = LOWER(:approval)")
    List<UserEntity> findByRoleAndAdminApproval(@Param("role") String role, @Param("approval") String approval);
}
