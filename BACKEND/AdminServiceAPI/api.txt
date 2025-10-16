# AdminServiceAPI - Simple Reference

**Port:** 9095 | **Gateway:** 8305

## URLs

### Get Pending Drivers
```
GET http://localhost:9095/admin/pending-drivers
GET http://localhost:8305/admin/pending-drivers
```

### Get Approved Drivers
```
GET http://localhost:9095/admin/approved-drivers
GET http://localhost:8305/admin/approved-drivers
```

### Get Rejected Drivers
```
GET http://localhost:9095/admin/rejected-drivers
GET http://localhost:8305/admin/rejected-drivers
```

### Get Driver Details
```
GET http://localhost:9095/admin/driver/123
GET http://localhost:8305/admin/driver/123
```

### Approve Driver
```
PUT http://localhost:9095/admin/driver/123/approve
PUT http://localhost:8305/admin/driver/123/approve
```

### Reject Driver
```
PUT http://localhost:9095/admin/driver/123/reject
PUT http://localhost:8305/admin/driver/123/reject

Body (optional): {"comment": "reason"}
```

## Copy-Paste URLs
```
http://localhost:9095/admin/pending-drivers
http://localhost:8305/admin/pending-drivers
http://localhost:9095/admin/approved-drivers
http://localhost:8305/admin/approved-drivers
http://localhost:9095/admin/rejected-drivers
http://localhost:8305/admin/rejected-drivers
http://localhost:9095/admin/driver/123
http://localhost:8305/admin/driver/123
http://localhost:9095/admin/driver/123/approve
http://localhost:8305/admin/driver/123/approve
http://localhost:9095/admin/driver/123/reject
http://localhost:8305/admin/driver/123/reject
```

**Note:** Replace `123` with actual driver ID