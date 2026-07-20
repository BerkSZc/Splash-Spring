package com.berksozcu.controller.impl;

import com.berksozcu.annotation.RateLimit;
import com.berksozcu.controller.IReceivedCollectionController;
import com.berksozcu.dto.collection.CollectionDto;
import com.berksozcu.entites.collections.ReceivedCollection;
import com.berksozcu.service.IReceivedCollectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/rest/api/receive")
@RateLimit(capacity = 5000)
public class ReceivedCollectionControllerImpl implements IReceivedCollectionController {

    @Autowired
    private IReceivedCollectionService receivedCollectionService;

    @Override
    @PostMapping("/add/{id}")
    public CollectionDto addCollection(@PathVariable(name = "id") Long id, @RequestBody CollectionDto receivedCollection,
                                       @RequestParam String schemaName) {
        return receivedCollectionService.addCollection(id, receivedCollection, schemaName);
    }

    @Override
    @PutMapping("/edit/{id}")
    public CollectionDto editReceivedCollection(@PathVariable(name ="id") Long id, @RequestBody CollectionDto receivedCollection,
            @RequestParam String schemaName) {
        return receivedCollectionService.editReceivedCollection(id, receivedCollection, schemaName);
    }

    @Override
    @DeleteMapping("/delete/{id}")
    public void deleteReceivedCollection(@PathVariable(name = "id") Long id,
            @RequestParam String schemaName) {
        receivedCollectionService.deleteReceivedCollection(id, schemaName);
    }

    @Override
    @GetMapping("/find-by-year")
    public Page<CollectionDto> getReceivedCollectionByYear(@RequestParam(defaultValue = "0") int page,
                                                                @RequestParam(defaultValue = "20") int size,
                                                                @RequestParam(required = false) String search,
                                                                @RequestParam int year,
                                                                @RequestParam String schemaName) {
        return receivedCollectionService.getReceivedCollectionsByYear(page, size, search, year, schemaName);
    }
}
