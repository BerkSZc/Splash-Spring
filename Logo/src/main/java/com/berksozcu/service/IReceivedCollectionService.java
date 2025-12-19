package com.berksozcu.service;

import com.berksozcu.entites.collections.ReceivedCollection;

import java.util.List;

public interface IReceivedCollectionService {
    public ReceivedCollection addCollection(Long id, ReceivedCollection receivedCollection);
    public List<ReceivedCollection> getAll();
    public ReceivedCollection editReceivedCollection(Long id, ReceivedCollection receivedCollection);
    public void deleteReceivedCollection(Long id);
}
