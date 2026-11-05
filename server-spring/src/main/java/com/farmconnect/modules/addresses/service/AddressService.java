package com.farmconnect.modules.addresses.service;

import com.farmconnect.modules.addresses.model.Address;
import com.farmconnect.modules.addresses.repository.AddressRepository;
import com.farmconnect.modules.users.model.User;
import com.farmconnect.modules.users.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public AddressService(AddressRepository addressRepository, UserRepository userRepository) {
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<Address> getAddresses(Long userId) {
        return addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId);
    }

    @Transactional
    public Address createAddress(Long userId, Map<String, String> data) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        long count = addressRepository.countByUserId(userId);
        boolean isDefault = count == 0;

        Address address = new Address();
        address.setUser(user);
        address.setFullName(data.get("fullName"));
        address.setMobile(data.get("mobile"));
        address.setHouse(data.get("house"));
        address.setStreet(data.get("street"));
        address.setVillage(data.get("village"));
        address.setDistrict(data.get("district"));
        address.setState(data.get("state"));
        address.setPincode(data.get("pincode"));
        address.setLandmark(data.get("landmark"));
        address.setType(data.getOrDefault("type", "Home"));
        address.setIsDefault(isDefault);

        return addressRepository.save(address);
    }

    @Transactional
    public Address updateAddress(Long userId, Long addressId, Map<String, String> data) {
        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Address not found"));

        if (data.containsKey("fullName")) address.setFullName(data.get("fullName"));
        if (data.containsKey("mobile")) address.setMobile(data.get("mobile"));
        if (data.containsKey("house")) address.setHouse(data.get("house"));
        if (data.containsKey("street")) address.setStreet(data.get("street"));
        if (data.containsKey("village")) address.setVillage(data.get("village"));
        if (data.containsKey("district")) address.setDistrict(data.get("district"));
        if (data.containsKey("state")) address.setState(data.get("state"));
        if (data.containsKey("pincode")) address.setPincode(data.get("pincode"));
        if (data.containsKey("landmark")) address.setLandmark(data.get("landmark"));
        if (data.containsKey("type")) address.setType(data.get("type"));

        return addressRepository.save(address);
    }

    @Transactional
    public void deleteAddress(Long userId, Long addressId) {
        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Address not found"));
        addressRepository.delete(address);
    }

    @Transactional
    public Address setDefaultAddress(Long userId, Long addressId) {
        addressRepository.resetDefaultAddressForUser(userId);
        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Address not found"));
        address.setIsDefault(true);
        return addressRepository.save(address);
    }
}
