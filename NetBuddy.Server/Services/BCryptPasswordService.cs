﻿using NetBuddy.Server.Interfaces;
using static BCrypt.Net.BCrypt;

namespace NetBuddy.Server.Services;

public class BCryptPasswordService : IPasswordService
{
    public string Hash(string password) => HashPassword(password);

    public bool Verify(string enteredPassword, string hashedPassword) => 
        BCrypt.Net.BCrypt.Verify(enteredPassword, hashedPassword);
}