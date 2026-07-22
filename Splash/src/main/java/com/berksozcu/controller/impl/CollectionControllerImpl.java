package com.berksozcu.controller.impl;

import com.berksozcu.annotation.RateLimit;
import com.berksozcu.dto.collection.CollectionDto;
import com.berksozcu.entites.collections.CollectionType;
import com.berksozcu.service.ICollectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/rest/api/collection")
@RateLimit(capacity = 5000)
public class CollectionControllerImpl {

    @Autowired
    private ICollectionService collectionService;


    @PostMapping("/add/{id}")
    public CollectionDto addCollection(@PathVariable(name = "id") Long id, @RequestBody CollectionDto paymentCompany,
                                           @RequestParam String schemaName) {
        return collectionService.addCollection(id, paymentCompany, schemaName);
    }

    @PutMapping("/edit/{id}")
    public CollectionDto editCollection(@PathVariable(name = "id") Long id, @RequestBody CollectionDto paymentCompany,
                                             @RequestParam String schemaName) {
        return collectionService.editCollection(id, paymentCompany, schemaName);
    }

    @DeleteMapping("/delete/{id}")
    public void deleteCollection(@PathVariable(name = "id") Long id,
                                     @RequestParam String schemaName,
                                     @RequestParam CollectionType type) {
        collectionService.deleteCollection(id, schemaName, type);
    }

    @GetMapping("/find-by-year")
    public Page<CollectionDto> getCollectionsByYear(@RequestParam(defaultValue = "0") int page,
                                                           @RequestParam(defaultValue = "20") int size,
                                                           @RequestParam(required = false) String search,
                                                           @RequestParam int year,
                                                           @RequestParam String schemaName,
                                                           @RequestParam(required = false) CollectionType type) {
        return collectionService.getCollectionsByYear(page, size, search, year, schemaName, type);
    }

}
