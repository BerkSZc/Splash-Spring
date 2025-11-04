package com.berksozcu.controller.impl;

import com.berksozcu.controller.IReceivedCollectionController;
import com.berksozcu.entites.ReceivedCollection;
import com.berksozcu.service.IReceivedCollectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/rest/api/receive")
public class ReceivedCollectionControllerImpl implements IReceivedCollectionController {

    @Autowired
    private IReceivedCollectionService receivedCollectionService;

    @Override
    @PostMapping("/add/{id}")
    public ReceivedCollection addCollection(@PathVariable(name = "id") Long id, @RequestBody ReceivedCollection receivedCollection) {
        return receivedCollectionService.addCollection(id, receivedCollection);
    }
}
