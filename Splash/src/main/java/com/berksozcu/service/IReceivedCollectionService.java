package com.berksozcu.service;

import com.berksozcu.entites.collections.ReceivedCollection;

import java.util.List;

public interface IReceivedCollectionService {
     ReceivedCollection addCollection(Long id, ReceivedCollection receivedCollection, String schemaName);
     List<ReceivedCollection> getAll();
     ReceivedCollection editReceivedCollection(Long id, ReceivedCollection receivedCollection, String schemaName);
     void deleteReceivedCollection(Long id, String schemaName);
     List<ReceivedCollection> getReceivedCollectionsByYear(int year);
}
