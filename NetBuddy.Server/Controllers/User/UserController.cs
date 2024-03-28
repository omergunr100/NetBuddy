﻿using Marten;
using Microsoft.AspNetCore.Mvc;
using NetBuddy.Server.DTOs;
using NetBuddy.Server.Interfaces.Security;
using NetBuddy.Server.Models.User;

namespace NetBuddy.Server.Controllers.User;

[Route("api/[controller]")]
[ApiController]
public class UserController : ControllerBase
{
    private readonly IDocumentStore _store;
    private readonly IPasswordService _passwordService;

    public UserController(IDocumentStore store, IPasswordService passwordService)
    {
        _store = store;
        _passwordService = passwordService;
    }
    
    
    // todo: remove this endpoint, it's for testing only
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        await using var session = _store.LightweightSession();

        var userList = await session.Query<UserInfo>().ToListAsync();
        
        return Ok(userList);
    }
    
    // todo: remove this endpoint, it's for testing only
    [HttpGet("{email}")]
    public async Task<IActionResult> GetByEmail([FromRoute] string email)
    {
        await using var session = _store.LightweightSession();

        var user = await session.Query<UserInfo>().Where(user => user.Email == email).FirstOrDefaultAsync();
        
        if (user == null)
            return NotFound();
        return Ok(user);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] UserDTO userDto)
    {
        // validate the incoming data (should also be done on the client side)
        bool valid = userDto.Validate(out string message);
        
        if (!valid)
            return BadRequest(message);

        await using var session = _store.LightweightSession();
        
        // check if the email is already taken by another user
        var existingUser =
            await session.Query<UserInfo>().Where(user => user.Email == userDto.Email).FirstOrDefaultAsync();

        if (existingUser != null)
            return BadRequest("Email is already taken");
        
        // create and save the new user
        session.Store(userDto.ToUser());

        await session.SaveChangesAsync();
        
        return Ok();
    }
    
    [HttpDelete]
    public async Task<IActionResult> Delete([FromBody] UserDTO userDto)
    {
        await using var session = _store.LightweightSession();

        var user = await session.Query<UserInfo>().Where(user => user.Email == userDto.Email).FirstOrDefaultAsync();
        
        // if the user doesn't exist, return a 400
        if (user == null)
            return BadRequest();
        
        // if the password is incorrect, return a 400 (and not a 404 'not found')
        // this is done to prevent attackers from guessing email addresses
        if (userDto.Username != user.Username ||
            !_passwordService.Verify(userDto.Password, user.PasswordHash)) 
            return BadRequest();

        // delete the user
        session.Delete(user);

        await session.SaveChangesAsync();

        return Ok();
    }
    
    [HttpPut]
    public async Task<IActionResult> Update([FromBody] (UserDTO oldUserDto, UserDTO newUserDto) _)
    {
        var (oldUserDto, newUserDto) = _;
        
        // validate the incoming data (should also be done on the client side)
        bool valid = oldUserDto.Validate(out string message);
        if (!valid)
            return BadRequest(message);
        
        valid = newUserDto.Validate(out message);
        if (!valid)
            return BadRequest(message);
        
        await using var session = _store.LightweightSession();

        var user = await session.Query<UserInfo>().Where(user => user.Email == oldUserDto.Email).FirstOrDefaultAsync();
        
        // if the user doesn't exist, return a 400
        if (user == null)
            return BadRequest();
        
        // if the password is incorrect, return a 400 (and not a 404 'not found')
        // this is done to prevent attackers from guessing email addresses
        if (oldUserDto.Username != user.Username ||
            !_passwordService.Verify(oldUserDto.Password, user.PasswordHash)) 
            return BadRequest();

        // update the user
        user.Username = newUserDto.Username;
        user.PasswordHash = _passwordService.Hash(newUserDto.Password);

        session.Update(user);

        await session.SaveChangesAsync();

        return Ok();
    }
}