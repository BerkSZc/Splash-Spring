package com.berksozcu.controller.impl;

import com.berksozcu.controller.IReceivedCollectionController;
import com.berksozcu.entites.collections.ReceivedCollection;
import com.berksozcu.service.IReceivedCollectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/rest/api/receive")
public class ReceivedCollectionControllerImpl implements IReceivedCollectionController {

    @Autowired
    private IReceivedCollectionService receivedCollectionService;

    @Override
    @PostMapping("/add/{id}")
    public ReceivedCollection addCollection(@PathVariable(name = "id") Long id, @RequestBody ReceivedCollection receivedCollection,
                                            @RequestParam String schemaName) {
        return receivedCollectionService.addCollection(id, receivedCollection, schemaName);
    }

    @Override
    @GetMapping("/find-all")
    public List<ReceivedCollection> getAll() {
        return receivedCollectionService.getAll();
    }

    @Override
    @PutMapping("/edit/{id}")
    public ReceivedCollection editReceivedCollection(@PathVariable(name ="id") Long id, @RequestBody ReceivedCollection receivedCollection,
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
    @GetMapping("/find-year/{year}")
    public List<ReceivedCollection> getReceivedCollectionByYear(@PathVariable(name = "year") int year) {
        return receivedCollectionService.getReceivedCollectionsByYear(year);
    }
}
