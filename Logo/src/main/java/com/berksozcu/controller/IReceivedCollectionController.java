package com.berksozcu.controller;

import com.berksozcu.entites.collections.ReceivedCollection;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

public interface IReceivedCollectionController {
    public ReceivedCollection addCollection(Long id, ReceivedCollection receivedCollection);
    public List<ReceivedCollection> getAll();
    public ReceivedCollection editReceivedCollection(@PathVariable(name ="id") Long id, @RequestBody ReceivedCollection receivedCollection);
    public void deleteReceivedCollection(@PathVariable(name = "id") Long id);
}
