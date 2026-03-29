package com.loloyta.dto;

import java.util.List;

public class StockAuditoriaRequestDto {

    private Long almacenId;
    private List<StockAsignacionItemDto> items;

    public StockAuditoriaRequestDto() {
    }

    public Long getAlmacenId() {
        return almacenId;
    }

    public void setAlmacenId(Long almacenId) {
        this.almacenId = almacenId;
    }

    public List<StockAsignacionItemDto> getItems() {
        return items;
    }

    public void setItems(List<StockAsignacionItemDto> items) {
        this.items = items;
    }
}