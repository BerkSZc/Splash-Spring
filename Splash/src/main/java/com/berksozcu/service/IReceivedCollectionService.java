package com.berksozcu.service;

import com.berksozcu.entites.collections.ReceivedCollection;

import java.util.List;

public interface IReceivedCollectionService {
     ReceivedCollection addCollection(Long id, ReceivedCollection receivedCollection);
     List<ReceivedCollection> getAll();
     ReceivedCollection editReceivedCollection(Long id, ReceivedCollection receivedCollection);
     void deleteReceivedCollection(Long id);
     List<ReceivedCollection> getReceivedCollectionsByYear(int year);
}
