package com.zola.controllers;

import com.zola.dto.request.attribute.SizeRequest;
import com.zola.dto.request.attribute.ColorRequest;
import com.zola.dto.response.ApiResponse;
import com.zola.dto.response.attribute.SizeResponse;
import com.zola.dto.response.attribute.ColorResponse;
import com.zola.services.size.SizeService;
import com.zola.services.color.ColorService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/attributes")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@PreAuthorize("hasAuthority('ADMIN')")
public class AttributeController {

    SizeService sizeService;
    ColorService colorService;

    // --- SIZES ---
    @PostMapping("/sizes")
    public ApiResponse<SizeResponse> createSize(@RequestBody @Valid SizeRequest request) {
        return ApiResponse.<SizeResponse>builder()
                .result(sizeService.createSize(request))
                .build();
    }

    @GetMapping("/sizes")
    public ApiResponse<List<SizeResponse>> getAllSizes() {
        return ApiResponse.<List<SizeResponse>>builder()
                .result(sizeService.getAllSizes())
                .build();
    }

    @PutMapping("/sizes/{id}")
    public ApiResponse<SizeResponse> updateSize(@PathVariable Long id, @RequestBody @Valid SizeRequest request) {
        return ApiResponse.<SizeResponse>builder()
                .result(sizeService.updateSize(id, request))
                .build();
    }

    @DeleteMapping("/sizes/{id}")
    public ApiResponse<String> deleteSize(@PathVariable Long id) {
        sizeService.deleteSize(id);
        return ApiResponse.<String>builder()
                .result("Size deleted")
                .build();
    }

    // --- COLORS ---
    @PostMapping("/colors")
    public ApiResponse<ColorResponse> createColor(@RequestBody @Valid ColorRequest request) {
        return ApiResponse.<ColorResponse>builder()
                .result(colorService.createColor(request))
                .build();
    }

    @GetMapping("/colors")
    public ApiResponse<List<ColorResponse>> getAllColors() {
        return ApiResponse.<List<ColorResponse>>builder()
                .result(colorService.getAllColors())
                .build();
    }

    @PutMapping("/colors/{id}")
    public ApiResponse<ColorResponse> updateColor(@PathVariable Long id, @RequestBody @Valid ColorRequest request) {
        return ApiResponse.<ColorResponse>builder()
                .result(colorService.updateColor(id, request))
                .build();
    }

    @DeleteMapping("/colors/{id}")
    public ApiResponse<String> deleteColor(@PathVariable Long id) {
        colorService.deleteColor(id);
        return ApiResponse.<String>builder()
                .result("Color deleted")
                .build();
    }
}
