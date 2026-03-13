package com.zola.controllers;

import com.zola.dto.response.ApiResponse;
import com.zola.dto.response.attribute.ColorResponse;
import com.zola.dto.response.attribute.SizeResponse;
import com.zola.services.color.ColorService;
import com.zola.services.size.SizeService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/attributes")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PublicAttributeController {

    ColorService colorService;
    SizeService sizeService;

    @GetMapping("/colors")
    public ApiResponse<List<ColorResponse>> getAllColors() {
        return ApiResponse.<List<ColorResponse>>builder()
                .result(colorService.getAllColors())
                .build();
    }

    @GetMapping("/sizes")
    public ApiResponse<List<SizeResponse>> getAllSizes() {
        return ApiResponse.<List<SizeResponse>>builder()
                .result(sizeService.getAllSizes())
                .build();
    }
}
