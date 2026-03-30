package com.loloyta.dto;

import java.util.List;

public class RolPermisosUpdateRequest {

    private List<Long> permisoIds;

    public List<Long> getPermisoIds() {
        return permisoIds;
    }

    public void setPermisoIds(List<Long> permisoIds) {
        this.permisoIds = permisoIds;
    }
}