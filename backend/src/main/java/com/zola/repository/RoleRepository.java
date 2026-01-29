package com.zola.repository;

import com.zola.entity.Role;
import com.zola.enums.PredefinedRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleRepository extends JpaRepository<Role, PredefinedRole> {
    Boolean deleteByRoleName(PredefinedRole roleName);
}
